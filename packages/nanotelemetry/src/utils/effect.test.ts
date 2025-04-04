import { describe, expect, test } from "vitest";
import { effect } from "./effect.js";

describe(effect.name, () => {
  test("sync / success", () => {
    let success = false;
    let settled = false;
    let error = false;
    const result = effect({
      fn: () => 42,
      onSuccess() {
        success = true;
      },
      onSettled() {
        settled = true;
      },
      onError() {
        error = true;
      },
    });

    expect(result).toBe(42);
    expect(success).toBe(true);
    expect(settled).toBe(true);
    expect(error).toBe(false);
  });

  test("sync / failure", () => {
    let success = false;
    let settled = false;
    let error = false;

    let result: number | undefined;
    try {
      effect({
        fn() {
          throw 42;
        },
        onSuccess() {
          success = true;
        },
        onSettled() {
          settled = true;
        },
        onError() {
          error = true;
        },
      });
    } catch (e) {
      result = e as number;
    }

    expect(result).toBe(42);
    expect(success).toBe(false);
    expect(settled).toBe(true);
    expect(error).toBe(true);
  });

  test("async / success", async () => {
    let success = false;
    let settled = false;
    let error = false;
    const result = await effect({
      fn: () => Promise.resolve(42),
      onSuccess() {
        success = true;
      },
      onSettled() {
        settled = true;
      },
      onError() {
        error = true;
      },
    });

    expect(result).toBe(42);
    expect(success).toBe(true);
    expect(settled).toBe(true);
    expect(error).toBe(false);
  });

  test("async / failure", async () => {
    let success = false;
    let settled = false;
    let error = false;

    let result: number | undefined;
    try {
      await effect({
        async fn() {
          throw 42;
        },
        onSuccess() {
          success = true;
        },
        onSettled() {
          settled = true;
        },
        onError() {
          error = true;
        },
      });
    } catch (e) {
      result = e as number;
    }

    expect(result).toBe(42);
    expect(success).toBe(false);
    expect(settled).toBe(true);
    expect(error).toBe(true);
  });
});
