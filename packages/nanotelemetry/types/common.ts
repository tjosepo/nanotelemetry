type OpenTelemetryAttribute = { key: string; value: OpenTelemetryValue };

type OpenTelemetryValue =
  | Record<string, never>
  | { intValue: number }
  | { stringValue: string }
  | { boolValue: boolean }
  | { doubleValue: number }
  | { arrayValue: { values: Array<OpenTelemetryValue> } };

interface OpenTelemetryResource {
  attributes: Array<OpenTelemetryAttribute>;
}

interface OpenTelemetryLogs {
  resourceLogs: Array<OpenTelemetryResourceLog>;
}

interface OpenTelemetryResourceLog {
  resource: OpenTelemetryResource;
}

interface OpenTelemetryResource {
  attributes: Array<OpenTelemetryAttribute>;
}

interface OpenTelemetryScopeLog {
  scope?: OpenTelemetryScope;
  logRecords: Array<OpenTelemetryLogRecord>;
}

interface OpenTelemetryLogRecord {
  timeUnixNano?: string;
  observedTimeUnixNano: string;
  severityNumber?: number;
  severityText?: string;
  attributes?: Array<OpenTelemetryAttribute>;
  droppedAttributesCount?: number;
  flags?: number;
  traceId?: string;
  spanId?: string;
  body?: OpenTelemetryValue;
}

interface OpenTelemetryScope {
  name: string;
  version: string;
  attributes: Array<OpenTelemetryAttribute>;
}
