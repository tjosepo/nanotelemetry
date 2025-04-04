import { NanotelemetryClient } from "nanotelemetry";
import {onLCP, onINP, onCLS, Metric} from "web-vitals";
const client = new NanotelemetryClient({
  batchTime: 5000,
  serviceName: "web",
  url: "https://api.honeycomb.io",
  headers: {
    "x-honeycomb-team": "",
  }
});

function logMetric(metric: Metric) {
  client.log("web_vital", {
    attributes: {
      "web_vital.name": metric.name,
      "web_vital.id": metric.id,
      "web_vital.value": metric.value,
      "web_vital.rating": metric.rating
  }})
}
onLCP(logMetric);
onINP(logMetric);
onCLS(logMetric);