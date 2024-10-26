import { Group, Paper, ScrollArea, Space, Table } from "@mantine/core";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
import React from "react";
import LapTimeCell from "../LapTimeCell/LapTimeCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerNameInput from "../SwimmerNameInput/SwimmerNameInput.tsx";

export default function LapTimeGridView() {
  const [disciplines, swimmers] = useCombinedStore(useShallow((state) => [state.disciplines, state.swimmers]));

  const swimmersSorted = Array.from(swimmers.values()).sort(compareByYearThenGenderThenLastname);

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

  return (
    <Paper shadow="md" withBorder p="xl">
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
}
