import { describe, expect, test } from "vitest";
import { getRandomHexLowercase } from "./encoding.js";

describe(getRandomHexLowercase.name, () => {
  test("16 bytes", () => {
    const id = getRandomHexLowercase(16);
    expect(id.length).toBe(32);
    expect(id).toMatch(/^[0-9a-f]{32}$/i);
  });

  test("8 bytes", () => {
    const id = getRandomHexLowercase(8);
    expect(id.length).toBe(16);
    expect(id).toMatch(/^[0-9a-f]{16}$/i);
  });
});
