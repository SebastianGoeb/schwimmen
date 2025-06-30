import { expect, test } from "vitest";
import { relayScore, relayTime, RelayValidity, validateRelay } from "./relay.ts";
import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import * as path from "node:path";
import { HighPerfConfiguration, HighPerfRelayConfiguration } from "../../eingabe/configuration.ts";
import { RelayState } from "../state/state.ts";

type RelayScoreTestSpec = {
  description: string;
  expectedTime: number;
  expectedScore: number;
  expectedErrors: string[];
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
  const parsed = parse(content, { delimiter: "|", quote: "`", trim: true, columns: true });
  return parsed.map((t: Raw<T>) => parseRaw(t));
}

function extractRelayErrors(r: RelayValidity): string[] {
  return [
    r.minOneFemaleViolations > 0 && "min-one-female",
    r.minOneMaleViolations > 0 && "min-one-male",
    r.maxOneStartPerSwimmerViolations > 0 && "max-one-start-per-swimmer",
  ].filter(Boolean) as string[];
}

test.each(parseTests<RelayScoreTestSpec>("relay.test.csv"))(
  "$description -> $expectedSeconds",
  ({
    expectedTime,
    expectedScore,
    expectedErrors,
    disciplineToSwimmerToTime,
    team,
    disciplineIndices,
    swimmerIndices,
    numSwimmers,
    genders,
  }) => {
    const time = relayTime({ swimmerIndices }, { team, disciplineIndices }, disciplineToSwimmerToTime);
    expect(time).toBe(expectedTime);

    const score = relayScore(
      { swimmerIndices },
      { team, disciplineIndices },
      disciplineToSwimmerToTime,
      numSwimmers,
      genders,
    );
    expect(score).toBe(expectedScore);

    const validity = validateRelay({ swimmerIndices }, numSwimmers, genders);
    expect(validity.valid).toBe(expectedErrors.length == 0);

    const errors = extractRelayErrors(validity);
    expect(errors.sort()).toEqual(expectedErrors.sort());
  },
);
