import { describe, expect, test } from "@jest/globals";
import { renderStaffeln, renderTeam } from "./sheet";
import { buildKonfiguration } from "../eingabe/konfiguration";
import { MinMax } from "../eingabe/minmax";
import { Geschlecht } from "../eingabe/geschlecht";

const konfiguration = buildKonfiguration({
  parameters: {
    alleMuessenSchwimmen: true,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minStartsProSchwimmer: 0,
    maxStartsProSchwimmer: 5,
    anzahlTeams: 2,
    maxZeitspanneProStaffelSeconds: 1,
  },
  minMax: new Map<string, MinMax>(),
  staffeln: [
    {
      name: "4 x 25 LG",
      team: false,
      disziplinen: ["25m Brust", "25m Brust", "25m Beine", "25m Beine"],
    },
    {
      name: "4 x 25 Brust",
      team: false,
      disziplinen: ["25m Brust", "25m Brust", "25m Brust", "25m Brust"],
    },
  ],
  schwimmerList: [
    {
      name: "Name A",
      zeitenSeconds: new Map<string, number>([
        ["25m Brust", 30],
        ["25m Beine", 50],
      ]),
    },
    {
      name: "Name B",
      zeitenSeconds: new Map<string, number>([
        ["25m Brust", 35.5],
        ["25m Beine", 55.5],
      ]),
    },
    {
      name: "Name C",
      zeitenSeconds: new Map<string, number>([
        ["25m Brust", 40.5],
        ["25m Beine", 50.5],
      ]),
    },
    {
      name: "Name D",
      zeitenSeconds: new Map<string, number>([
        ["25m Brust", 45.1],
        ["25m Beine", 55.1],
      ]),
    },
  ],
  geschlecht: new Map<string, Geschlecht>([
    ["Name A", Geschlecht.MALE],
    ["Name B", Geschlecht.MALE],
    ["Name C", Geschlecht.FEMALE],
    ["Name D", Geschlecht.FEMALE],
  ]),
});

describe("ausgabe", () => {
  describe("sheet", () => {
    test("render staffeln produces a small grid", () => {
      expect(renderStaffeln(konfiguration, { staffelId: 1, startBelegungen: [0, 2, 1, 3] })).toEqual([
        ["2", undefined],
        ["4 x 25 Brust", undefined],
        ["Name A", "00:30,0"],
        ["Name C", "00:40,5"],
        ["Name B", "00:35,5"],
        ["Name D", "00:45,1"],
        [undefined, "02:31,1"],
      ]);
    });

    test("render lagen produces a wider grid", () => {
      expect(renderStaffeln(konfiguration, { staffelId: 0, startBelegungen: [0, 2, 1, 3] })).toEqual([
        ["1", undefined, undefined],
        ["4 x 25 LG", undefined, undefined],
        ["25m Brust", "Name A", "00:30,0"],
        ["25m Brust", "Name C", "00:40,5"],
        ["25m Beine", "Name B", "00:55,5"],
        ["25m Beine", "Name D", "00:55,1"],
        [undefined, undefined, "03:01,1"],
      ]);
    });

    test("render team produces a side-by-side staffeln", () => {
      expect(
        renderTeam(
          konfiguration,
          {
            staffelBelegungen: [
              { staffelId: 0, startBelegungen: [0, 2, 1, 3] },
              { staffelId: 1, startBelegungen: [0, 2, 1, 3] },
            ],
          },
          1,
          4,
        ),
      ).toEqual([
        ["1", undefined, undefined, undefined, "2", undefined],
        ["4 x 25 LG", undefined, undefined, undefined, "4 x 25 Brust", undefined],
        ["25m Brust", "Name A", "00:30,0", undefined, "Name A", "00:30,0"],
        ["25m Brust", "Name C", "00:40,5", undefined, "Name C", "00:40,5"],
        ["25m Beine", "Name B", "00:55,5", undefined, "Name B", "00:35,5"],
        ["25m Beine", "Name D", "00:55,1", undefined, "Name D", "00:45,1"],
        [undefined, undefined, "03:01,1", undefined, undefined, "02:31,1"],
      ]);
    });
  });
});
