import type { KeyValue } from "./common.ts";

/** Resource information */
export type Resource = {
  /** Set of attributes that describe the resource. */
  attributes: KeyValue[];
  /** Number of dropped attributes. If the value is 0, then no attributes were dropped. */
  droppedAttributesCount?: number;
};
