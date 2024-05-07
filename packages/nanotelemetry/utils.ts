interface OpenTelemetryClientInit {
  url: string;
  serviceName: string;
  headers?: Record<string, string>;
}

interface SpanContext {
  traceId: string;
  spanId: string;
}

interface SpanInit<T> {
  ctx?: SpanContext;
  name: string;
  attributes?: Record<string, unknown>;
  fn: (ctx: SpanContext) => T;
}

export class OpenTelemetryClient {
  #url: string;
  #serviceName: string;
  #headers: Record<string, string> = {};

  constructor(init: OpenTelemetryClientInit) {
    this.#url = init.url.endsWith("/") ? init.url.slice(0, -1) : init.url;
    this.#serviceName = init.serviceName;
    if (init.headers) {
      this.#headers = init.headers;
    }
  }

  async log(
    data: Record<string, string | number | boolean | null | undefined>
  ) {
    const log = {
      resourceLogs: [
        {
          resource: {
            attributes: toOpenTelemetryAttributes({
              "service.name": this.#serviceName,
            }),
          },
          scopeLogs: [
            {
              logRecords: [
                {
                  timeUnixNano: getTimeUnixNano(),
                  attributes: toOpenTelemetryAttributes(data),
                },
              ],
            },
          ],
        },
      ],
    };

    fetch(`${this.#url}/v1/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.#headers,
      },
      body: JSON.stringify(log),
      keepalive: true,
    });
  }

  trace<T>(init: SpanInit<T>): T {
    const traceId = init.ctx?.traceId ?? generateId(16);
    const spanId = generateId(8);

    const start = performance.now();
    const startTimeUnixNano = getTimeUnixNano();

    const onComplete = () => {
      const end = performance.now();
      const endTimeUnixNano = getTimeUnixNano();

      const span = {
        resourceSpans: [
          {
            resource: {
              attributes: toOpenTelemetryAttributes({
                "service.name": this.#serviceName,
              }),
            },
            scopeSpans: [
              {
                spans: [
                  {
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
                  },
                ],
              },
            ],
          },
        ],
      };

      fetch(`${this.#url}/v1/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.#headers,
        },
        body: JSON.stringify(span),
        keepalive: true,
      });
    };

    const result = init.fn({ traceId, spanId });

    if (result instanceof Promise) {
      result.then(onComplete);
    } else {
      onComplete();
    }

    return result;
  }
}

type OpenTelemetryAttribute = { key: string; value: OpenTelemetryValue };

type OpenTelemetryValue =
  | Record<string, never>
  | { intValue: number }
  | { stringValue: string }
  | { boolValue: boolean }
  | { doubleValue: number }
  | { arrayValue: { values: Array<OpenTelemetryValue> } };

function toOpenTelemetryAttributeValue(
  value: unknown
): OpenTelemetryValue | null {
  if (typeof value === "string") {
    return { stringValue: value };
  } else if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { intValue: value };
    } else {
      return { doubleValue: value };
    }
  } else if (typeof value === "boolean") {
    return { boolValue: value };
  } else if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value
          .map(toOpenTelemetryAttributeValue)
          .filter((v) => v !== null) as Array<OpenTelemetryValue>,
      },
    };
  }

  return null;
}

function toOpenTelemetryAttributes(
  obj: Record<string, string | number | boolean | null | undefined>
) {
  const attributes: Array<OpenTelemetryAttribute> = [];
  for (const [key, value] of Object.entries(obj)) {
    const attributeValue = toOpenTelemetryAttributeValue(value);
    if (attributeValue !== null) {
      attributes.push({ key, value: attributeValue });
    }
  }
  return attributes;
}

function generateId(bytes = 16) {
  const array = new Uint8Array(bytes);
  self.crypto.getRandomValues(array);

  let id = "";
  for (const byte of array) {
    id += byte.toString(16).padStart(2, "0").toUpperCase();
  }

  return id;
}

function getTimeUnixNano() {
  return (performance.timeOrigin + performance.now()).toFixed() + "0000";
}
