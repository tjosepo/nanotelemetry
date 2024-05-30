import type {
  InstrumentationScope,
  KeyValue,
} from "../../common/v1/common.d.ts";
import type { Resource } from "../../resource/v1/resource.d.ts";

export interface MetricsData {
  resourceMetrics: ResourceMetrics[];
}

export interface ResourceMetrics {
  resource?: Resource;
  scopeMetrics: ScopeMetrics[];
  schemaUrl?: string;
}

export interface ScopeMetrics {
  scope?: InstrumentationScope;
  metrics: Metric[];
  schemaUrl?: string;
}

type Metric = {
  name: string;
  description: string;
  unit: string;
  metadata: KeyValue[];
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
  aggregationTemporality: AggregationTemporality;
  isMonotonic: boolean;
};

export type Histogram = {
  dataPoints: HistogramDataPoint[];
  aggregationTemporality: AggregationTemporality;
};

export type ExponentialHistogram = {
  dataPoints: ExponentialHistogramDataPoint[];
  aggregationTemporality: AggregationTemporality;
};

export type Summary = {
  dataPoints: SummaryDataPoint[];
};

export enum AggregationTemporality {
  AGGREGATION_TEMPORALITY_UNSPECIFIED = 0,
  AGGREGATION_TEMPORALITY_DELTA = 1,
  AGGREGATION_TEMPORALITY_CUMULATIVE = 2,
}

export enum DataPointFlags {
  DATA_POINT_FLAGS_DO_NOT_USE = 0,
  DATA_POINT_FLAGS_NO_RECORDED_VALUE_MASK = 1,
}

type NumberDataPoint = {
  attributes: KeyValue[];
  startTimeUnixNano?: string;
  timeUnixNano: string;
  exemplars?: Exemplar[];
  flags?: number;
} & ({ asDouble: number } | { asInt: number });

type HistogramDataPoint = {
  attributes: KeyValue[];
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
  attributes: KeyValue[];
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
  attributes: KeyValue[];
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
  filteredAttributes: KeyValue[];
  timeUnixNano: number;
  spanId?: string;
  traceId?: string;
} & ({ asDouble: number } | { asInt: number });
