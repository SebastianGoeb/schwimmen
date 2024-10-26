import { Group, Paper, ScrollArea, SimpleGrid, Space, Table } from "@mantine/core";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Discipline } from "../../model/discipline.ts";
import React from "react";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
import LapTimeCell from "../LapTimeCell/LapTimeCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerNameInput from "../SwimmerNameInput/SwimmerNameInput.tsx";

export default function LapTimeDisciplinesView() {
  const [disciplines, swimmers] = useCombinedStore(useShallow((state) => [state.disciplines, state.swimmers]));

  const swimmersSorted = Array.from(swimmers.values()).sort(compareByYearThenGenderThenLastname);

  function renderDiscipline(discipline: Discipline): React.ReactNode {
    return (
      <Paper shadow="md" withBorder p="xl" key={discipline.id}>
        <ScrollArea>
          <h2>{discipline.name}</h2>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Zeit</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{swimmersSorted.map((swimmer) => renderRow(swimmer, discipline))}</Table.Tbody>
          </Table>
          <Space h="md" />
          <Group justify="flex-end">
            <SwimmerAddButton />
          </Group>
        </ScrollArea>
      </Paper>
    );
  }

  function renderRow(swimmer: Swimmer, discipline: Discipline): React.ReactNode {
    return (
      <Table.Tr key={swimmer.id}>
        <Table.Td>
          <SwimmerNameInput swimmer={swimmer} />
        </Table.Td>
        <Table.Td>
          <LapTimeCell swimmer={swimmer} disciplineId={discipline.id} />
        </Table.Td>
        <Table.Td>
          <SwimmerRemoveButton id={swimmer.id} />
        </Table.Td>
      </Table.Tr>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      {Array.from(disciplines.values()).map((discipline) => renderDiscipline(discipline))}
    </SimpleGrid>
  );
}
