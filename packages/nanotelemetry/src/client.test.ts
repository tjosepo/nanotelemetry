import { describe, expect, test } from "vitest";
import { NanotelemetryClient } from "./client.ts";
import { StatusCode } from "./otlp/v1/trace.ts";
import { traceparent } from "./utils/traceparent.ts";

describe.skip("TelemetryClient", () => {
  test("TelemetryClient / trace / throw", () => {
    const client = new NanotelemetryClient({
      batchTime: Infinity,
      url: "http://localhost:3000",
      serviceName: "test",
    });


    function shouldThrow() {
      client.trace("shouldThrow", () => {
        throw new Error("foo");
      });

      client.log("Error", { severity: "error" })
    }

client.trace("hello", ({ traceId, spanId}) => {
  const tp = traceparent({ traceId, spanId });
  console.log("traceparent", tp);
})

    // Expect the function to have thrown
    expect(shouldThrow).toThrowError("foo");

    // Execution should still have been logged
    const events = client.getTelemetryEvents();
    expect(events.length).toBe(1);
    const [event] = events as [TelemetryEventSpan];
    expect(event.type).toBe("span");
    expect(event.data.name).toBe("shouldThrow");
    expect(event.data.status?.code).toBe(2);
    expect(event.data.status?.message).toBe("Error: foo");
  });

  test("TelemetryClient / trace / using", () => {
    const client = new NanotelemetryClient({
      batchTime: Infinity,
      url: "http://localhost:3000",
      serviceName: "test",
    });

    function shouldThrow() {
      client.trace({
        name: "shouldThrow",
        fn() {
          throw new Error("foo");
        },
      });
    }

    // Expect the function to have thrown
    expect(shouldThrow).toThrowError("foo");

    // Execution should still have been logged
    const events = client.getTelemetryEvents();
    expect(events.length).toBe(1);
    const [event] = events as [TelemetryEventSpan];
    expect(event.type).toBe("span");
    expect(event.data.name).toBe("shouldThrow");
    expect(event.data.status?.code).toBe(StatusCode.STATUS_CODE_ERROR);
    expect(event.data.status?.message).toBe("Error: foo");
  });
});

