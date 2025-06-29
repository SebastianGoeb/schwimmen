import { penaltySecondsPerViolation } from "./common.ts";
import { expect, test } from "vitest";

test("penalty should be 5 minutes", () => {
  expect(penaltySecondsPerViolation).toBe(300);
});
