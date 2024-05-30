export type AnyValue =
  | { stringValue: string }
  | { boolValue: boolean }
  | { intValue: number }
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

/** A message representing the instrumentation scope information such as the fully qualified name and version.  */
export type InstrumentationScope = {
  /** An empty instrumentation scope name means the name is unknown. */
  name: string;
  version: string;
  /** Additional attributes that describe the scope.*/
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
};
