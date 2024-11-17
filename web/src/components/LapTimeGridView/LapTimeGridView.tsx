import { Group, Paper, ScrollArea, Space, Stack, Table } from "@mantine/core";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
import React from "react";
import LapTimeCell from "../LapTimeCell/LapTimeCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerNameInput from "../SwimmerNameInput/SwimmerNameInput.tsx";
import { uniq } from "lodash-es";

export default function LapTimeGridView() {
  const [disciplines, swimmers] = useCombinedStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function renderRow(swimmer: Swimmer): React.ReactNode {
    const cells = [
      <Table.Td key="name">
        <SwimmerNameInput swimmer={swimmer} />
      </Table.Td>,
      ...disciplines.map((discipline) => (
        <Table.Td key={`discipline-${discipline.id}`}>
          <LapTimeCell swimmer={swimmer} disciplineId={discipline.id} />
        </Table.Td>
      )),
      <Table.Td key="remove">
        <SwimmerRemoveButton id={swimmer.id} />
      </Table.Td>,
    ];
    return <Table.Tr key={swimmer.id}>{cells}</Table.Tr>;
  }

  const ageGroups = uniq(Array.from(swimmers.values(), (s) => s.ageGroup)).sort();

  return (
    <Stack>
      {ageGroups.map((ageGroup) => {
        const swimmersSorted = Array.from(swimmers.values())
          .filter((s) => s.ageGroup === ageGroup)
          .sort(compareByYearThenGenderThenLastname);

        return (
          <Paper shadow="md" withBorder p="xl" key={ageGroup}>
            <h2>{ageGroup}</h2>
            <ScrollArea>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    {["Name", ...disciplines.map((it) => it.name)].map((header) => (
                      <Table.Th key={header}>{header}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{swimmersSorted.map((swimmer) => renderRow(swimmer))}</Table.Tbody>
              </Table>
              <Space h="md" />
              <Group justify="flex-end">
                <SwimmerAddButton />
              </Group>
            </ScrollArea>
          </Paper>
        );
      })}
    </Stack>
  );
}
