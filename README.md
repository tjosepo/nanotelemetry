# `nanotelemetry` [WIP]

`nanotelemetry` is a tiny (3kb gzipped) OTLP client optimized for the browser.

The aim is to provide a simple SDK which is fully compliant with the [OTLP/HTTP specification](https://opentelemetry.io/docs/specs/otlp/).

The OpenTelemetry API and SDK specifications are willfully ignored, as focusing
on those specifications would not produce the best library for the web.

## Example

```ts
import { NanotelemetryClient } from "nanotelemetry";

// Create a client
const client = new NanotelemetryClient({
  serviceName: "My Website";
  url: "/api"; // will send data to `/api/v1/traces` and `/api/v1/logs`
});

// Add global attributes
client.addGlobalAttribute("user.id", user.id);

// Create a trace
client.trace("Parent operation", async ({ trace }) => {
  // Traces can have child traces, which can also have child traces, etc.
  const a = await trace("First operation", ({ trace: subtrace }) => doSomething(subtrace));

  // Traces can declare attributes, which will be sent alongside the trace.
  const b = await trace("Second operation", { attributes: { input: a }}, () => doSomethingElse(a));
});

// Create a log
client.log("Error: Something went wrong", { severity: "error" });

// Logs can be any structured data
client.log({ user: "john", operation: "logged-in" }, { severity: "info" });

// Logs can be declared in the context of a trace
client.trace("Dangerous operation", ({ log }) => {
  try {
    trySomething();
  } catch (e) {
    log(e.message, { severity: "error" }) // <-- This log will appear inside the "Dangerous operation" trace
  }
});

// You can send a traceparent header to the server
import { traceparent } from "nanotelemetry";

client.trace("Call the backend", ({ spanId, traceId }) => {
  fetch("/api/books", {
    headers: {
      "traceparent": traceparent({ spanId, traceId })
      // output: "traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01"
    }
  });
});

// Send all data still in memory to the server.
client.flush();
```

### Core Web Vitals

```js
import { onLCP, onINP, onCLS } from "web-vitals";
import { NanotelemetryClient } from "nanotelemetry";

// Create the nanotelemetry client
const client = new NanotelemetryClient({
  serviceName: "My Website";
  url: "/api";
});

// Function that logs all the metrics
const handleMetric = (metric) => {
  client.log("web_vital", {
    attributes: {
      "web_vital.name": metric.name,
      "web_vital.id": metric.id,
      "web_vital.rating": metric.rating,
      "web_vital.value": metric.value,
    }
  });
};

// Capture the metrics
onLCP(handleMetric);
onINP(handleMetric);
onCLS(handleMetric);
```