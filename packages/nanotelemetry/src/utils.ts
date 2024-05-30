import type { AnyValue, KeyValue } from "@nanotelemetry/otlp/v1";

export function toOpenTelemetryValue(value: unknown): AnyValue | null {
  if (value === null || value === undefined) {
    return null;
  } else if (typeof value === "string") {
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
          .map(toOpenTelemetryValue)
          .filter((v) => v !== null) as AnyValue[],
      },
    };
  } else if (typeof value === "object" && value !== null) {
    return { kvlistValue: { values: toOpenTelemetryAttributes(value) } };
  }

  return null;
}

export function parseOTLP(
  value: AnyValue | KeyValue | AnyValue[] | KeyValue[]
): any {
  if (Array.isArray(value)) {
    if (value.every((v) => "key" in v)) {
      return value
        .map(parseOTLP)
        .reduce((previous, current) => ({ ...previous, ...current }), {});
    } else {
      return value.map(parseOTLP);
    }
  } else if ("key" in value) {
    return { [value.key]: parseOTLP(value.value) };
  } else if ("stringValue" in value) {
    return value.stringValue;
  } else if ("intValue" in value) {
    return value.intValue;
  } else if ("doubleValue" in value) {
    return value.doubleValue;
  } else if ("boolValue" in value) {
    return value.boolValue;
  } else if ("arrayValue" in value) {
    return parseOTLP(value.arrayValue.values);
  } else if ("kvlistValue" in value) {
    return value.kvlistValue.values
      .map(parseOTLP)
      .reduce((previous, current) => ({ ...previous, ...current }), {});
  }
  throw new Error("Invalid OTLP value");
}

export function toOpenTelemetryAttributes(obj: unknown): KeyValue[] {
  if (typeof obj !== "object" || obj === null) {
    return [];
  }

  const keyValues: KeyValue[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const anyValue = toOpenTelemetryValue(value);
    if (anyValue !== null) {
      keyValues.push({ key, value: anyValue });
    }
  }

  return keyValues;
}

export function generateHexId(bytes = 16): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);

  let id = "";
  for (const byte of array) {
    id += byte.toString(16).padStart(2, "0");
  }

  return id.toUpperCase();
}

export function getTimeUnixNano(): string {
  return (performance.timeOrigin + performance.now()).toFixed() + "0000";
}
