import { Swimmer } from "../../../../model/swimmer.ts";
import { Discipline } from "../../../../model/discipline.ts";
import { HighPerfConfiguration, Parameters } from "../../eingabe/configuration.ts";
import { RelayState, State, TeamState } from "./state.ts";
import { max, sum } from "lodash-es";
import { Relay } from "../../../../model/relay.ts";

export interface Result {
  teams: TeamResult[];
  time: number;
}

export interface TeamResult {
  relays: RelayResult[];
  time: number;
}

export interface RelayResult {
  relay: Relay;
  legs: RelayLegResult[];
  time: number;
}

export interface RelayLegResult {
  swimmer: Swimmer;
  discipline: Discipline;
  time: number;
}

export function fromState(parameters: Parameters, configuration: HighPerfConfiguration, state: State): Result {
  const teamResults = state.teams.map((teamState) => fromTeamState(parameters, configuration, teamState));
  return {
    teams: teamResults,
    time: sum(teamResults.map((it) => it.time)),
  };
}

function fromTeamState(parameters: Parameters, configuration: HighPerfConfiguration, teamState: TeamState): TeamResult {
  const relayResults = teamState.relays.map((relayState, relayIndex) =>
    fromRelayState(parameters, configuration, relayState, relayIndex),
  );
  return {
    relays: relayResults,
    time: sum(relayResults.map((it) => it.time)),
  };
}

function fromRelayState(
  parameters: Parameters,
  configuration: HighPerfConfiguration,
  relayState: RelayState,
  relayIndex: number,
): RelayResult {
  const legs: RelayLegResult[] = relayState.swimmerIndices.map((swimmerIndex, legIndex) => {
    const disciplineIndex = configuration.relays[relayIndex].disciplineIndices[legIndex];
    return {
      swimmer: parameters.swimmers[swimmerIndex],
      discipline: parameters.disciplines[disciplineIndex],
      time: configuration.disciplineToSwimmerToTime[disciplineIndex][swimmerIndex]!,
    };
  });
  const times = legs.map((leg) => leg.time);
  return {
    relay: parameters.relays[relayIndex],
    legs,
    time: configuration.relays[relayIndex].team ? max(times)! : sum(times),
  };
}
