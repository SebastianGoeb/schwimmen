import { describe, expect, test } from "vitest";
import { relayTime } from "./relay.ts";
import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import * as path from "node:path";

interface TestSpec {
  description: string;
  disciplineToSwimmerToTime: (number | undefined)[][];
  team: boolean;
  disciplineIndices: number[];
  swimmerIndices: number[];
  expectedSeconds: number;
}

type Raw<T> = {
  [K in keyof T]: K extends "description" ? T[K] : string;
};

function parseRaw<T extends { description: string }>(raw: Raw<T>): T {
  const result = {} as T;
  for (const key in raw) {
    if (key === "description") {
      result[key] = raw[key] as T[typeof key];
    } else {
      result[key] = JSON.parse(raw[key] as string);
    }
  }
  return result;
}

function parseTests(filename: string): TestSpec[] {
  const content = fs.readFileSync(path.resolve(__dirname, filename), "utf8");
  const parsed = parse(content, { delimiter: "|", trim: true, columns: true });
  return parsed.map((t: Raw<TestSpec>) => parseRaw(t));
}

describe("relayTime", () => {
  test.each(parseTests("relay.test.csv"))(
    "$description -> $expectedSeconds",
    ({ disciplineToSwimmerToTime, team, disciplineIndices, swimmerIndices, expectedSeconds }) => {
      const seconds = relayTime({ swimmerIndices }, { team, disciplineIndices }, disciplineToSwimmerToTime);
      expect(seconds).toBe(expectedSeconds);
    },
  );
});
