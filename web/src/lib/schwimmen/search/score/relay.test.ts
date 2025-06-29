import { describe, expect, test } from "vitest";
import { relayScore, relayTime } from "./relay.ts";
import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import * as path from "node:path";
import { HighPerfConfiguration, HighPerfRelayConfiguration } from "../../eingabe/configuration.ts";
import { RelayState } from "../state/state.ts";

type RelayTimeTestSpec = {
  description: string;
  expectedSeconds: number;
} & HighPerfRelayConfiguration &
  Pick<HighPerfConfiguration, "disciplineToSwimmerToTime"> &
  RelayState;

type RelayScoreTestSpec = {
  description: string;
  expectedSeconds: number;
} & HighPerfRelayConfiguration &
  Pick<HighPerfConfiguration, "disciplineToSwimmerToTime" | "numSwimmers" | "genders"> &
  RelayState;

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

function parseTests<T extends { description: string }>(filename: string): T[] {
  const content = fs.readFileSync(path.resolve(__dirname, filename), "utf8");
  const parsed = parse(content, { delimiter: "|", trim: true, columns: true });
  return parsed.map((t: Raw<T>) => parseRaw(t));
}

describe("relayTime", () => {
  test.each(parseTests<RelayTimeTestSpec>("relay.time.test.csv"))(
    "$description -> $expectedSeconds",
    ({ expectedSeconds, disciplineToSwimmerToTime, team, disciplineIndices, swimmerIndices }) => {
      const seconds = relayTime({ swimmerIndices }, { team, disciplineIndices }, disciplineToSwimmerToTime);
      expect(seconds).toBe(expectedSeconds);
    },
  );
});

describe("relayScore", () => {
  test.each(parseTests<RelayScoreTestSpec>("relay.score.test.csv"))(
    "$description -> $expectedSeconds",
    ({ expectedSeconds, disciplineToSwimmerToTime, team, disciplineIndices, swimmerIndices, numSwimmers, genders }) => {
      const seconds = relayScore(
        { swimmerIndices },
        { team, disciplineIndices },
        disciplineToSwimmerToTime,
        numSwimmers,
        genders,
      );
      expect(seconds).toBe(expectedSeconds);
    },
  );
});
