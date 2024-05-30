import type {
  LogRecord,
  LogsData,
  Span,
  TracesData,
} from "@nanotelemetry/otlp/v1";
import { TelemetryQueue } from "./telemetryQueue.js";
import {
  toOpenTelemetryAttributes,
  getTimeUnixNano,
  generateHexId,
  toOpenTelemetryValue,
} from "./utils.js";

export interface TelemetryEventSpan {
  type: "span";
  data: Span;
}

export interface TelemetryEventLog {
  type: "log";
  data: LogRecord;
}

export type TelemetryEvent = TelemetryEventSpan | TelemetryEventLog;

declare interface Window {
  __NANOTELEMETRY_DEVTOOLS__: {
    onEvent(event: any): void;
  };
}

export interface TelemetryClientConfig {
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

export interface SpanContext {
  traceId: string;
  spanId: string;
}

export interface SpanInit<T = void> {
  ctx?: SpanContext;
  name: string;
  attributes?: Record<string, unknown>;
  fn: (ctx: SpanContext) => T;
}

export class TelemetryClient {
  #config: TelemetryClientConfig;
  #queue: TelemetryQueue;

  constructor(config: TelemetryClientConfig) {
    this.#config = config;
    this.#queue = new TelemetryQueue();

    if (process.env.NODE_ENV === "development" && "window" in globalThis) {
      window.postMessage({
        id: "nanotelemetry-devtools",
        value: { type: "init" },
      });
    }
  }

  flush() {
    const events = this.#queue.getAll();

    const { logRecords, spans } = events.reduce<{
      logRecords: LogRecord[];
      spans: Span[];
    }>(
      (obj, event) => {
        if (event.type === "log") {
          obj.logRecords.push(event.data);
        }

        if (event.type === "span") {
          obj.spans.push(event.data);
        }

        return obj;
      },
      { logRecords: [], spans: [] }
    );

    if (logRecords.length > 0) {
      const logs: LogsData = {
        resourceLogs: [
          {
            resource: {
              attributes: toOpenTelemetryAttributes({
                service: this.#config.serviceName,
              }),
            },
            scopeLogs: [{ logRecords }],
          },
        ],
      };

      fetch(`${this.#config.url}/v1/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.#config.headers,
        },
        body: JSON.stringify(logs),
        keepalive: true,
      });
    }

    if (spans.length > 0) {
      const traces: TracesData = {
        resourceSpans: [
          {
            resource: {
              attributes: toOpenTelemetryAttributes({
                service: this.#config.serviceName,
              }),
            },
            scopeSpans: [{ spans }],
          },
        ],
      };

      fetch(`${this.#config.url}/v1/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.#config.headers,
        },
        body: JSON.stringify(traces),
        keepalive: true,
      });
    }
  }

  async log(body: unknown, attributes: Record<string, unknown> = {}) {
    const logRecord: LogRecord = {
      timeUnixNano: getTimeUnixNano(),
      body: toOpenTelemetryValue(body) ?? undefined,
      attributes: toOpenTelemetryAttributes(attributes),
    };

    this.#queue.add({ type: "log", data: logRecord });

    if (process.env.NODE_ENV === "development" && "window" in globalThis) {
      window.postMessage({
        id: "nanotelemetry-devtools",
        value: {
          type: "log",
          data: logRecord,
        },
      });
    }
  }

  trace<T>(init: SpanInit<T>): T {
    const traceId = init.ctx?.traceId ?? generateHexId(16);
    const spanId = generateHexId(8);

    const start = performance.now();
    const startTimeUnixNano = getTimeUnixNano();

    const onComplete = (error?: unknown) => {
      const end = performance.now();
      const endTimeUnixNano = getTimeUnixNano();

      const span: Span = {
        traceId,
        spanId,
        parentSpanId: init.ctx?.spanId,
        name: init.name,
        startTimeUnixNano,
        endTimeUnixNano,
        attributes: toOpenTelemetryAttributes({
          ...init.attributes,
          duration_ms: end - start,
        }),
        status: error ? { code: 2, message: String(error) } : undefined,
      };

      this.#queue.add({ type: "span", data: span });
    };

    try {
      const result = init.fn({ traceId, spanId });

      if (result instanceof Promise) {
        result
          .then(() => onComplete())
          .catch((error) => {
            onComplete(error);
            throw error;
          });
      } else {
        onComplete();
      }

      return result;
    } catch (error) {
      onComplete(error);
      throw error;
    }
  }

  getTelemetryEvents() {
    return this.#queue.getAll();
  }
}
