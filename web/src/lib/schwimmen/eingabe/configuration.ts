import { Gender } from "./gender.ts";
import { Discipline } from "../../../model/discipline.ts";
import { Relay } from "../../../model/relay.ts";
import { Swimmer } from "../../../model/swimmer.ts";
import { parseMaskedZeitToSeconds } from "../../../utils/masking.ts";

export interface Parameters {
  allMustSwim: boolean;
  minSwimmersPerTeam: number;
  maxSwimmersPerTeam: number;
  minMalesProTeam: number;
  minFemalesProTeam: number;
  minStartsPerSwimmer: number;
  maxStartsPerSwimmer: number;
  numTeams: number;
  maxTimeDifferencePerRelaySeconds: number;
  disciplines: Discipline[];
  relays: Relay[];
  swimmers: Swimmer[];
}

export interface Hyperparameters {
  smartMutationRate: number;
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}

export interface HighPerfConfiguration {
  allMustSwim: boolean;
  minSwimmersPerTeam: number;
  maxSwimmersPerTeam: number;
  minMalesPerTeam: number;
  minFemalesPerTeam: number;
  numTeams: number;
  maxTimeDifferencePerRelaySeconds: number;
  minStartsPerSwimmer: Int8Array;
  maxStartsPerSwimmer: Int8Array;
  relays: HighPerfRelay[];
  numSwimmers: number;
  genders: Gender[];
  disciplineToSwimmerTimes: { swimmerIndex: number; time: number }[][];
  disciplineToSwimmerToTime: (number | undefined)[][];
}

export interface HighPerfRelay {
  disciplineIndices: number[];
  team: boolean;
}

export function buildHighPerfConfiguration(parameters: Parameters): HighPerfConfiguration {
  const minStartsProSchwimmer = buildMinStartsPerSchwimmer(parameters);
  const maxStartsProSchwimmer = buildMaxStartsPerSchwimmer(parameters);
  const genders = buildGenders(parameters);
  const disciplineToSwimmerToTime = buildDisciplineToSwimmerToTime(parameters);
  const relays = buildHighPerfRelays(parameters);
  const disciplineToSwimmerTimes = buildDisciplineToSwimmerTimes(parameters);

  return {
    allMustSwim: parameters.allMustSwim,
    minSwimmersPerTeam: parameters.minSwimmersPerTeam,
    maxSwimmersPerTeam: parameters.maxSwimmersPerTeam,
    minMalesPerTeam: parameters.minMalesProTeam,
    minFemalesPerTeam: parameters.minFemalesProTeam,
    minStartsPerSwimmer: minStartsProSchwimmer,
    maxStartsPerSwimmer: maxStartsProSchwimmer,
    numTeams: parameters.numTeams,
    maxTimeDifferencePerRelaySeconds: parameters.maxTimeDifferencePerRelaySeconds,
    relays: relays,
    numSwimmers: parameters.swimmers.length,
    genders,
    disciplineToSwimmerTimes,
    disciplineToSwimmerToTime,
  };
}

function buildMinStartsPerSchwimmer(parameters: Parameters): Int8Array {
  const minStarts = new Int8Array(parameters.swimmers.length);
  for (let schwimmerIndex = 0; schwimmerIndex < parameters.swimmers.length; schwimmerIndex++) {
    minStarts[schwimmerIndex] = parameters.swimmers[schwimmerIndex].minStarts ?? parameters.minStartsPerSwimmer;
  }
  return minStarts;
}

function buildMaxStartsPerSchwimmer(parameters: Parameters): Int8Array {
  const maxStarts = new Int8Array(parameters.swimmers.length);
  for (let schwimmerIndex = 0; schwimmerIndex < parameters.swimmers.length; schwimmerIndex++) {
    maxStarts[schwimmerIndex] = parameters.swimmers[schwimmerIndex].maxStarts ?? parameters.maxStartsPerSwimmer;
  }
  return maxStarts;
}

function buildGenders(parameters: Parameters): Gender[] {
  return parameters.swimmers.map((swimmer) => (swimmer.gender === "m" ? Gender.MALE : Gender.FEMALE));
}

function buildDisciplineToSwimmerToTime(parameters: Parameters): (number | undefined)[][] {
  return parameters.disciplines.map((discipline) =>
    parameters.swimmers.map((swimmer) => lapTimeToSwimmerTime(swimmer, discipline)),
  );
}

function buildDisciplineToSwimmerTimes(parameters: Parameters): { swimmerIndex: number; time: number }[][] {
  return parameters.disciplines.map((discipline) => {
    return parameters.swimmers
      .map((swimmer, swimmerIndex) => {
        return { swimmerIndex, time: lapTimeToSwimmerTime(swimmer, discipline) };
      })
      .filter(hasTime);
  });
}

function lapTimeToSwimmerTime(swimmer: Swimmer, discipline: Discipline): number | undefined {
  const lapTime = swimmer.lapTimes.get(discipline.id);
  if (lapTime === undefined || !lapTime.enabled) {
    return undefined;
  }
  return parseMaskedZeitToSeconds(lapTime.seconds);
}

function hasTime(argument: {
  swimmerIndex: number;
  time: number | undefined;
}): argument is { swimmerIndex: number; time: number } {
  return argument.time !== undefined;
}

function buildHighPerfRelays(parameters: Parameters): HighPerfRelay[] {
  const relayIdToIndex = new Map<number, number>(parameters.relays.map((relay, relayIndex) => [relay.id, relayIndex]));
  const disciplineIdToIndex = new Map<number, number>(
    parameters.disciplines.map((discipline, disciplineIndex) => [discipline.id, disciplineIndex]),
  );

  return parameters.relays.map((relay) => ({
    id: relayIdToIndex.get(relay.id)!,
    disciplineIndices: relay.legs.flatMap((leg) =>
      new Array(leg.times).fill(disciplineIdToIndex.get(leg.disciplineId)),
    ),
    team: relay.team,
  }));
}

export function getSwimmerTime(
  configuration: HighPerfConfiguration,
  disciplineIndex: number,
  swimmerIndex: number,
): number {
  const zeit = configuration.disciplineToSwimmerToTime[disciplineIndex][swimmerIndex];
  if (zeit === undefined) {
    throw Error("Programmierfehler");
  }
  return zeit;
}
