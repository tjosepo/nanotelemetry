interface Traceparent {
  traceId: string;
  spanId: string;
  sampled?: boolean;
}

export function traceparent({ traceId, spanId, sampled }: Traceparent): string {
  const sampledHex = sampled ? '01' : '00';
  return `00-${traceId}-${spanId}-${sampledHex}`;
}