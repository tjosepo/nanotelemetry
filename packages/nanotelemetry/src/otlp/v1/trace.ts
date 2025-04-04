import type * as common from "./common.ts";
import type * as resource from "./resource.ts";

export interface TracesData {
  resourceSpans: ResourceSpans[];
}

export interface ResourceSpans {
  resource?: resource.Resource;
  scopeSpans: ScopeSpans[];
  schemaUrl?: string;
}

export interface ScopeSpans {
  scope?: common.InstrumentationScope;
  spans: Span[];
  schemaUrl?: string;
}

export interface Span {
  traceId: string;
  spanId: string;
  traceState?: string;
  parentSpanId?: string;
  flags?: number;
  name: string;
  kind?: number;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: common.KeyValue[];
  droppedAttributesCount?: number;
  events?: Event[];
  droppedEventsCount?: number;
  links?: Link[];
  droppedLinksCount?: number;
  status?: Status;
}

export interface Event {
  timeUnixNano: string;
  name: string;
  attributes?: common.KeyValue[];
  droppedAttributesCount?: number;
}

interface Link {
  traceId: string;
  spanId: string;
  traceState: string;
  attributes?: common.KeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
}

interface Status {
  message: string;
  code: typeof StatusCode[keyof typeof StatusCode];
}

/** For the semantics of status codes see
 * https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#set-status
 */
export const StatusCode = {
  /**  The default status. */
  STATUS_CODE_UNSET: 0,
  /**
   * The Span has been validated by an Application developer or Operator to
   * have completed successfully.
   */
  STATUS_CODE_OK: 1,
  /** The Span contains an error. */
  STATUS_CODE_ERROR: 2,
} as const;
