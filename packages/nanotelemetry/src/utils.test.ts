import {
  generateHexId,
  getTimeUnixNano,
  toOpenTelemetryValue,
  toOpenTelemetryAttributes,
  parseOTLP,
} from "./utils.js";
import { describe, expect, test } from "vitest";

describe("generateHexId", () => {
  test("generateHexId / 16 bytes", () => {
    const id = generateHexId(16);
    expect(id.length).toBe(32);
    expect(id).toMatch(/^[0-9a-f]{32}$/i);
  });

  test("generateHexId / 8 bytes", () => {
    const id = generateHexId(8);
    expect(id.length).toBe(16);
    expect(id).toMatch(/^[0-9a-f]{16}$/i);
  });
});

test("getTimeUnixNano", () => {
  const time = getTimeUnixNano();
  expect(time).toMatch(/^\d{17}$/);
});

describe("toOpenTelemetryAttributeValue", () => {
  test("toOpenTelemetryAttributeValue / stringValue", () => {
    const value = "foo";
    expect(toOpenTelemetryValue(value)).toEqual({
      stringValue: value,
    });
  });

  test("toOpenTelemetryAttributeValue / intValue", () => {
    const value = 100;
    expect(toOpenTelemetryValue(value)).toEqual({ intValue: value });
  });

  test("toOpenTelemetryAttributeValue / doubleValue", () => {
    const value = 0.1;
    expect(toOpenTelemetryValue(value)).toEqual({
      doubleValue: value,
    });
  });

  test("toOpenTelemetryAttributeValue / boolValue", () => {
    const value = true;
    expect(toOpenTelemetryValue(value)).toEqual({ boolValue: value });
  });

  test("toOpenTelemetryAttributeValue / arrayValue", () => {
    const value = [1, 2, 3];
    expect(toOpenTelemetryValue(value)).toEqual({
      arrayValue: {
        values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
      },
    });
  });

  test("toOpenTelemetryAttributeValue / kvlistValue", () => {
    const value = { foo: "bar" };
    expect(toOpenTelemetryValue(value)).toEqual({
      kvlistValue: {
        values: [{ key: "foo", value: { stringValue: "bar" } }],
      },
    });
  });
});

test("toOpenTelemetryAttributes", () => {
  const value = {
    string: "foo",
    int: 100,
    double: 0.1,
    bool: true,
    array: [1, 2, 3],
    kvlist: { foo: "bar" },
  };
  expect(toOpenTelemetryAttributes(value)).toEqual([
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

describe("parseOTLP", () => {
  test("parseOTLP / stringValue", () => {
    const value = "foo";
    expect(
      parseOTLP({
        stringValue: value,
      })
    ).toEqual(value);
  });

  test("parseOTLP / intValue", () => {
    const value = 100;
    expect(parseOTLP({ intValue: value })).toEqual(value);
  });

  test("parseOTLP / doubleValue", () => {
    const value = 0.1;
    expect(
      parseOTLP({
        doubleValue: value,
      })
    ).toEqual(value);
  });

  test("parseOTLP / boolValue", () => {
    const value = true;
    expect(parseOTLP({ boolValue: value })).toEqual(value);
  });

  test("parseOTLP / arrayValue", () => {
    expect(
      parseOTLP({
        arrayValue: {
          values: [{ intValue: 1 }, { intValue: 2 }, { intValue: 3 }],
        },
      })
    ).toEqual([1, 2, 3]);
  });

  test("parseOTLP / kvlistValue", () => {
    expect(
      parseOTLP({
        kvlistValue: {
          values: [{ key: "foo", value: { stringValue: "bar" } }],
        },
      })
    ).toEqual({ foo: "bar" });
  });

  test("parseOTLP", () => {
    expect(
      parseOTLP([
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
      ])
    ).toEqual({
      string: "foo",
      int: 100,
      double: 0.1,
      bool: true,
      array: [1, 2, 3],
      kvlist: { foo: "bar" },
    });
  });
});
