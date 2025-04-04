// Ref: https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/common/v1/common.proto

export type AnyValue =
  | { stringValue: string }
  | { boolValue: boolean }
  | { intValue: number | string }
  | { doubleValue: number }
  | { arrayValue: ArrayValue }
  | { kvlistValue: KeyValueList };

export type ArrayValue = {
  values: AnyValue[];
};

export type KeyValueList = {
  values: KeyValue[];
};

export type KeyValue = {
  key: string;
  value: AnyValue;
};

export type InstrumentationScope = {
  name: string;
  version: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};

export function encodeAnyValue(value: unknown): AnyValue | null {
  if (value === null || value === undefined) {
    return null;
  } else if (typeof value === "string") {
    return { stringValue: value };
  } else if (typeof value === "bigint") {
    return { intValue: value.toString() };
  } else if (typeof value === "number" && Number.isInteger(value)) {
    return { intValue: value };
  } else if (typeof value === "number") {
    return { doubleValue: value };
  } else if (typeof value === "boolean") {
    return { boolValue: value };
  } else if (Array.isArray(value)) {
    return { arrayValue: { values: encodeArrayValue(value) } };
  } else if (typeof value === "object") {
    return { kvlistValue: { values: encodeKeyValue(value) } };
  }

  return null;
}

function encodeArrayValue(array: unknown[]): AnyValue[] {
  const values: AnyValue[] = [];
  for (const item of array) {
    const encodedItem = encodeAnyValue(item);
    if (encodedItem !== null) {
      values.push(encodedItem);
    }
  }
  return values;
}

export function encodeKeyValue(obj: {}): KeyValue[] {
  const values: KeyValue[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const encodedValue = encodeAnyValue(val);
    if (encodedValue !== null) {
      values.push({ key, value: encodedValue });
    }
  }
  return values;
}
