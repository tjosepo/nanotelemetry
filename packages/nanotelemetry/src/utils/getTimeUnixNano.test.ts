import { expect, test } from "vitest";
import { getTimeUnixNano } from "./getTimeUnixNano.js";

test(getTimeUnixNano.name, () => {
  const time = getTimeUnixNano();
  expect(time).toMatch(/\d+/);
});