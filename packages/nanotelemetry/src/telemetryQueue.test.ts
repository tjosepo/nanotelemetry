import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TelemetryQueue } from "./telemetryQueue.js";

describe.skip("TelemetryQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("TelemetryQueue / batchTime = 0", () => {
    const log = { timeUnixNano: "1" };
    let calledWith = null;
    const queue = new TelemetryQueue({
      batchTime: 0,
      onFlush: ({ logs }) => {
        calledWith = logs;
      },
    });

    queue.queueLog(log);

    expect(calledWith).toEqual([log]);
  });

  test("TelemetryQueue / batchTime = 1000", () => {
    const log = { timeUnixNano: "1" };
    let calledWith = null;
    const queue = new TelemetryQueue({
      batchTime: 1,
      onFlush: ({ logs }) => {
        calledWith = logs;
      },
    });

    queue.queueLog(log);

    expect(calledWith).toBe(null);

    vi.advanceTimersByTime(1000);

    expect(calledWith).toEqual([log]);
  });
});
