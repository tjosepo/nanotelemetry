import { describe, expect, test } from "vitest";
import { encodeAnyValue, encodeKeyValue } from "./common.js";

describe(encodeAnyValue.name, () => {
  test("stringValue", () => {
    const value = "foo";
    expect(encodeAnyValue(value)).toEqual({
      stringValue: value,
    });
  });

  test("intValue", () => {
    const value = 100;
    expect(encodeAnyValue(value)).toEqual({ intValue: value });
  });

  test("intValue (bigint)", () => {
    const value = 100000000000000n;
    expect(encodeAnyValue(value)).toEqual({ intValue: "100000000000000" });
  });

  test("doubleValue", () => {
    const value = 0.1;
    expect(encodeAnyValue(value)).toEqual({
      doubleValue: value,
    });
  });

  test("boolValue", () => {
    const value = true;
    expect(encodeAnyValue(value)).toEqual({ boolValue: value });
  });

  test("arrayValue", () => {
    const value = [1, 2, 3];
    expect(encodeAnyValue(value)).toEqual({
      arrayValue: {
        values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
      },
    });
  });

  test("kvlistValue", () => {
    const value = { foo: "bar" };
    expect(encodeAnyValue(value)).toEqual({
      kvlistValue: {
        values: [{ key: "foo", value: { stringValue: "bar" } }],
      },
    });
  });
});

test(encodeKeyValue.name, () => {
  const value = {
    string: "foo",
    int: 100,
    double: 0.1,
    bool: true,
    array: [1, 2, 3],
    kvlist: { foo: "bar" },
  };
  expect(encodeKeyValue(value)).toEqual([
    {
      key: "string",
      value: { stringValue: "foo" },
    },
    {
      key: "int",
      value: { intValue: 100 },
    },
    {
      key: "double",
      value: { doubleValue: 0.1 },
    },
    {
      key: "bool",
      value: { boolValue: true },
    },
    {
      key: "array",
      value: {
        arrayValue: {
          values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
        },
      },
    },
    {
      key: "kvlist",
      value: {
        kvlistValue: {
          values: [{ key: "foo", value: { stringValue: "bar" } }],
        },
      },
    },
  ]);
});