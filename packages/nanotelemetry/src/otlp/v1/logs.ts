// Ref: https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/logs/v1/logs.proto

import type * as common from "./common.ts";
import type * as resource from "./resource.ts";

export interface LogsData {
  resourceLogs: ResourceLogs[];
}

export interface ResourceLogs {
  /** The resource for the logs in this message. If this field is not set then resource info is unknown. */
  resource?: resource.Resource;
  /** A list of ScopeLogs that originate from a resource. */
  scopeLogs: ScopeLog[];
  /**
   * The Schema URL, if known. This is the identifier of the Schema that the resource data
   * is recorded in. To learn more about Schema URL see
   * https://opentelemetry.io/docs/specs/otel/schemas/#schema-url
   * This schema_url applies to the data in the "resource" field. It does not apply
   * to the data in the "scope_logs" field which have their own schema_url field.
   */
  schemaUrl?: string;
}

/** A collection of Logs produced by a Scope. */
export interface ScopeLog {
  /**
   * The instrumentation scope information for the logs in this message.
   * Semantically when InstrumentationScope isn't set, it is equivalent with
   * an empty instrumentation scope name (unknown).
   */
  scope?: common.InstrumentationScope;
  /** A list of log records. */
  logRecords: LogRecord[];
  /**
   * The Schema URL, if known. This is the identifier of the Schema that the log data
   * is recorded in. To learn more about Schema URL see
   * https://opentelemetry.io/docs/specs/otel/schemas/#schema-url
   * This schema_url applies to all logs in the "logs" field.
   */
  schemaUrl?: string;
}

/** Possible values for LogRecord.SeverityNumber. */
export const SeverityNumber = {
  /** UNSPECIFIED is the default SeverityNumber, it MUST NOT be used. */
  SEVERITY_NUMBER_UNSPECIFIED: 0,
  SEVERITY_NUMBER_TRACE: 1,
  SEVERITY_NUMBER_TRACE2: 2,
  SEVERITY_NUMBER_TRACE3: 3,
  SEVERITY_NUMBER_TRACE4: 4,
  SEVERITY_NUMBER_DEBUG: 5,
  SEVERITY_NUMBER_DEBUG2: 6,
  SEVERITY_NUMBER_DEBUG3: 7,
  SEVERITY_NUMBER_DEBUG4: 8,
  SEVERITY_NUMBER_INFO: 9,
  SEVERITY_NUMBER_INFO2: 10,
  SEVERITY_NUMBER_INFO3: 11,
  SEVERITY_NUMBER_INFO4: 12,
  SEVERITY_NUMBER_WARN: 13,
  SEVERITY_NUMBER_WARN2: 14,
  SEVERITY_NUMBER_WARN3: 15,
  SEVERITY_NUMBER_WARN4: 16,
  SEVERITY_NUMBER_ERROR: 17,
  SEVERITY_NUMBER_ERROR2: 18,
  SEVERITY_NUMBER_ERROR3: 19,
  SEVERITY_NUMBER_ERROR4: 20,
  SEVERITY_NUMBER_FATAL: 21,
  SEVERITY_NUMBER_FATAL2: 22,
  SEVERITY_NUMBER_FATAL3: 23,
  SEVERITY_NUMBER_FATAL4: 24,
} as const;

export const LogRecordFlags = {
  /**
   * The zero value for the enum. Should not be used for comparisons. Instead
   * use bitwise "and" with the appropriate mask as shown above.
   */
  LOG_RECORD_FLAGS_DO_NOT_USE: 0,

  /** Bits 0-7 are used for trace flags. */
  LOG_RECORD_FLAGS_TRACE_FLAGS_MASK: 0x000000ff,
} as const;

export interface LogRecord {
  timeUnixNano: string;
  observedTimeUnixNano?: string;
  severityNumber?: typeof SeverityNumber[keyof typeof SeverityNumber];
  severityText?: string;
  attributes?: common.KeyValue[];
  droppedAttributesCount?: number;
  flags?: typeof LogRecordFlags[keyof typeof LogRecordFlags];
  traceId?: string;
  spanId?: string;
  body?: common.AnyValue;
}

export function getSeverityNumber(severity?: "trace" | "debug" | "info" | "warn" | "error" | "fatal") {
  switch (severity) {
    case "trace":
      return SeverityNumber.SEVERITY_NUMBER_TRACE;
    case "debug":
      return SeverityNumber.SEVERITY_NUMBER_DEBUG;
    case "info":
      return SeverityNumber.SEVERITY_NUMBER_INFO;
    case "warn":
      return SeverityNumber.SEVERITY_NUMBER_WARN;
    case "error":
      return SeverityNumber.SEVERITY_NUMBER_ERROR;
    case "fatal":
      return SeverityNumber.SEVERITY_NUMBER_FATAL;
    default:
      return SeverityNumber.SEVERITY_NUMBER_TRACE;
  }
}