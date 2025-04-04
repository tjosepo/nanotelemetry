import type * as common from "./common.ts";
import type * as resource from "./resource.ts";

export interface MetricsData {
  resourceMetrics: ResourceMetrics[];
}

export interface ResourceMetrics {
  resource?: resource.Resource;
  scopeMetrics: ScopeMetrics[];
  schemaUrl?: string;
}

export interface ScopeMetrics {
  scope?: common.InstrumentationScope;
  metrics: Metric[];
  schemaUrl?: string;
}

export type Metric = {
  name: string;
  description: string;
  unit: string;
  metadata: common.KeyValue[];
} & (
  | { gauge: Gauge }
  | { sum: Sum }
  | { histogram: Histogram }
  | { exponentialHistogram: ExponentialHistogram }
  | { summary: Summary }
);

export type Gauge = {
  dataPoints: NumberDataPoint[];
};

export type Sum = {
  dataPoints: NumberDataPoint[];
  aggregationTemporality: typeof AggregationTemporality[keyof typeof AggregationTemporality];
  isMonotonic: boolean;
};

export type Histogram = {
  dataPoints: HistogramDataPoint[];
  aggregationTemporality: typeof AggregationTemporality[keyof typeof AggregationTemporality];
};

export type ExponentialHistogram = {
  dataPoints: ExponentialHistogramDataPoint[];
  aggregationTemporality: typeof AggregationTemporality[keyof typeof AggregationTemporality];
};

export type Summary = {
  dataPoints: SummaryDataPoint[];
};

export const AggregationTemporality = {
  AGGREGATION_TEMPORALITY_UNSPECIFIED: 0,
  AGGREGATION_TEMPORALITY_DELTA: 1,
  AGGREGATION_TEMPORALITY_CUMULATIVE: 2,
} as const;

export const DataPointFlags = {
  DATA_POINT_FLAGS_DO_NOT_USE: 0,
  DATA_POINT_FLAGS_NO_RECORDED_VALUE_MASK: 1,
} as const;

type NumberDataPoint = {
  attributes: common.KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano: string;
  exemplars?: Exemplar[];
  flags?: number;
} & ({ asDouble: number } | { asInt: number });

type HistogramDataPoint = {
  attributes: common.KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano: string;
  count: number;
  sum?: number;
  bucketCounts?: number[];
  explicitBounds: number[];
  exemplars?: Exemplar[];
  flags?: number;
  min?: number;
  max?: number;
};

type ExponentialHistogramDataPoint = {
  attributes: common.KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano: string;
  count: number;
  sum?: number;
  scale: number;
  zeroCount: number;
  positive: Buckets;
  negative: Buckets;
  flags?: number;
  exemplars?: Exemplar[];
  min?: number;
  max?: number;
  zeroThreshold?: number;
};

type Buckets = {
  offset: number;
  buckerCounts: number[];
};

type SummaryDataPoint = {
  attributes: common.KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano: string;
  count: number;
  sum?: number;
  quantileValues: ValueAtQuantile[];
  flags?: number;
};

type ValueAtQuantile = {
  quantile: string;
  value: number;
};

type Exemplar = {
  filteredAttributes: common.KeyValue[];
  timeUnixNano: number;
  spanId?: string;
  traceId?: string;
} & ({ asDouble: number } | { asInt: number });
