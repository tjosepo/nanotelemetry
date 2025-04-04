import { encodeAnyValue, encodeKeyValue } from "./otlp/v1/common.ts";
import { StatusCode, type Span, type TracesData, type Event } from "./otlp/v1/trace.ts";
import { getSeverityNumber, type LogRecord, type LogsData } from "./otlp/v1/logs.ts";
import { effect } from "./utils/effect.ts";
import { getTimeUnixNano } from "./utils/getTimeUnixNano.ts";
import { getRandomHexLowercase } from "./utils/encoding.ts";

// declare interface Window {
//   __NANOTELEMETRY_DEVTOOLS__: {
//     onEvent(event: any): void;
//   };
// }

const DEFAULT_BATCH_TIME = 5 * 1000; // 5 seconds

interface LogAPI {
  (data: any, options?: LogOptions): void;
}

type LogOptions = {
  severity?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  traceId?: string;
  spanId?: string;
  attributes?: Record<string, unknown>;
}

interface TraceAPI {
  <T = void>(name: string, fn: TraceFn<T>): T;
  <T = void>(name: string, options: TraceOptions, fn: TraceFn<T>): T;
}

interface TraceFn<T> {
  (context: TraceContext): T;
}

interface TraceContext {
  trace: TraceAPI;
  log: LogAPI;
  addEvent: (name: string, attributes?: Record<string, unknown>) => void;
  addAttribute: (key: string, value: unknown) => void;
  traceId: string;
  spanId: string;
}

type TraceOptions = {
  traceId?: string;
  parentSpanId?: string;
  attributes?: Record<string, unknown>;
}

export interface NanotelemetryClientConfig {
  /**
   * The time in milliseconds that unsent events will remain in memory. When
   * the time expires, the events will be sent in a batch. Settings it to `0`
   * will disable batching and send events immediatly. Setting it to `Infinity`
   * will never send events.
   */
  batchTime?: number;
  url: string;
  serviceName: string;
  headers?: Record<string, string>;
}

export class NanotelemetryClient {
  #config: NanotelemetryClientConfig;
  #logRecords: LogRecord[] = [];
  #globalAttributes: Record<string, unknown> = {};
  #spans: Span[] = [];

  constructor(config: NanotelemetryClientConfig) {
    this.#config = config;

    // if (process.env.NODE_ENV === "development" && "window" in globalThis) {
    //   window.postMessage({
    //     id: "nanotelemetry-devtools",
    //     value: { type: "init" },
    //   });
    // }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.flush();
        }
      });
    }
  }

  addGlobalAttribute(key: string, value: unknown) {
    this.#globalAttributes[key] = value;
  }

  log: LogAPI = (data: unknown, options: LogOptions = {}) => {
    const isError = options.severity === "error" || options.severity === "fatal";
    this.#logRecords.push({
      timeUnixNano: getTimeUnixNano(),
      body: encodeAnyValue(data) ?? undefined,
      severityNumber: getSeverityNumber(options.severity),
      attributes: encodeKeyValue({ error: isError ? 1 : undefined, ...options.attributes }),
      traceId: options.traceId,
      spanId: options.spanId,
    });
    this.#scheduleLogsFlush();

    // if (process.env.NODE_ENV === "development" && "window" in globalThis) {
    //   window.postMessage({
    //     id: "nanotelemetry-devtools",
    //     value: {
    //       type: "log",
    //       data: logRecord,
    //     },
    //   });
    // }
  }

  trace: TraceAPI = <T>(name: string, optionsOrFn: TraceOptions | TraceFn<T>, maybeFn?: TraceFn<T>) => {
    const [options, fn] = typeof optionsOrFn === "function" ? [{}, optionsOrFn] : [optionsOrFn, maybeFn!];

    const traceId = options.traceId ?? getRandomHexLowercase(16);
    const spanId = getRandomHexLowercase(8);
    const events: Event[] = [];
    const attributes: Record<string, unknown> = { ...options.attributes };
    const startTimeUnixNano = getTimeUnixNano();

    return effect({
      fn: () => fn({
        traceId,
        spanId,
        trace: <U>(name: string, optionsOrFn: TraceOptions | TraceFn<U>, maybeFn?: TraceFn<U>): U => {
          const [options, fn] = typeof optionsOrFn === "function" ? [{}, optionsOrFn] : [optionsOrFn, maybeFn!];
          return this.trace(name, { traceId, parentSpanId: spanId, ...options }, fn);
        },
        log: (data: unknown, options: LogOptions = {}): void => {
          this.log(data, { traceId, spanId, ...options });
        },
        addEvent: (name: string, attributes?: Record<string, unknown>): void => {
          events.push({
            timeUnixNano: getTimeUnixNano(),
            name,
            attributes: attributes ? encodeKeyValue(attributes) : undefined,
          });
        },
        addAttribute: (key: string, value: unknown): void => {
          attributes[key] = value;
        }
       }),
      onSettled: (error?: unknown): void => {
        const isError = typeof error !== "undefined";
        this.#spans.push({
          traceId,
          spanId,
          parentSpanId: options.parentSpanId,
          name,
          startTimeUnixNano,
          events: events.length > 0 ? events : undefined,
          endTimeUnixNano: getTimeUnixNano(),
          attributes: encodeKeyValue({ error: isError ? 1 : undefined, ...attributes }),
          status: isError ? { code: StatusCode.STATUS_CODE_ERROR, message: String(error) } : undefined,
        });

        this.#scheduleTracesFlush();
      },
    })
  }

  flush() {
    this.#flushLogs();
    this.#flushTraces();
  }

  async #flushLogs() {
    if (this.#logRecords.length === 0) {
      return;
    }

    const logRecords = this.#logRecords;
    this.#logRecords = [];

    const logsData: LogsData = {
      resourceLogs: [
        {
          resource: {
            attributes: encodeKeyValue({
              "service.name": this.#config.serviceName,
              ...this.#globalAttributes,
            }),
          },
          scopeLogs: [{ logRecords }],
        },
      ],
    };

    const response = await fetch(`${this.#config.url}/v1/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.#config.headers,
      },
      body: JSON.stringify(logsData),
      keepalive: true,
    });

    if (!response.ok) {
      this.#logRecords = [...this.#logRecords, ...logRecords];
      this.#scheduleLogsFlush();
    }
  }

  async #flushTraces() {
    if (this.#spans.length === 0) {
      return;
    }

    const spans = this.#spans;
    this.#spans = [];

    const traces: TracesData = {
      resourceSpans: [
        {
          resource: {
            attributes: encodeKeyValue({
              "service.name": this.#config.serviceName,
              ...this.#globalAttributes,
            }),
          },
          scopeSpans: [{ spans }],
        },
      ],
    };

    const response = await fetch(`${this.#config.url}/v1/traces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.#config.headers,
      },
      body: JSON.stringify(traces),
      keepalive: true,
    });

    if (!response.ok) {
      this.#spans = [...this.#spans, ...spans];
      this.#scheduleTracesFlush();
    }
  }

  #logSignal: AbortSignal | undefined = undefined;
  #scheduleLogsFlush() {
    if (this.#config.batchTime === 0) {
      this.#flushLogs();
      return;
    }

    if (this.#config.batchTime === Infinity) {
      return;
    }

    if (this.#logSignal) {
      return;
    }

    this.#logSignal = AbortSignal.timeout(this.#config.batchTime ?? DEFAULT_BATCH_TIME);
    this.#logSignal.addEventListener("abort", () => {
      this.#logSignal = undefined;
      this.#flushLogs();
    });
  }

  #traceSignal: AbortSignal | undefined = undefined;
  #scheduleTracesFlush() {
    if (this.#config.batchTime === 0) {
      this.#flushTraces();
      return;
    }

    if (this.#config.batchTime === Infinity) {
      return;
    }

    if (this.#traceSignal) {
      return;
    }

    this.#traceSignal = AbortSignal.timeout(this.#config.batchTime ?? DEFAULT_BATCH_TIME);
    this.#traceSignal.addEventListener("abort", () => {
      this.#traceSignal = undefined;
      this.#flushTraces();
    });
  }
}