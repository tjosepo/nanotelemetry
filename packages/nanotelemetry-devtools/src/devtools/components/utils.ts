import type { AnyValue, KeyValue } from "@nanotelemetry/otlp/v1";

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
