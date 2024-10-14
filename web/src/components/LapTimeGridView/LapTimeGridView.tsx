import { Group, Paper, Space, Table } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
import { Discipline } from "../../model/discipline.ts";
import React from "react";
import LapTimeCell from "../LapTimeCell/LapTimeCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerNameInput from "../SwimmerNameInput/SwimmerNameInput.tsx";

export default function LapTimeGridView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  const swimmersSorted = Array.from(swimmers.values()).sort(compareByYearThenGenderThenLastname);

  function renderRow(swimmer: Swimmer, disciplines: Map<number, Discipline>): React.ReactNode {
    const cells = Array.from(disciplines.keys()).map((disciplineId) => (
      <Table.Td key={`discipline-${disciplineId}`}>
        <LapTimeCell swimmer={swimmer} disciplineId={disciplineId} />
      </Table.Td>
    ));
    const allCells = [
      <Table.Td key="name">
        <SwimmerNameInput swimmer={swimmer} />
      </Table.Td>,
      ...cells,
      <Table.Td key="remove">
        <SwimmerRemoveButton id={swimmer.id} />
      </Table.Td>,
    ];
    return <Table.Tr key={swimmer.id}>{allCells}</Table.Tr>;
  }

  return (
    <Paper shadow="md" withBorder p="xl">
      <Table>
        <Table.Thead>
          <Table.Tr>
            {["Name", ...Array.from(disciplines.values()).map((it) => it.name)].map((header) => (
              <Table.Th key={header}>{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{swimmersSorted.map((swimmer) => renderRow(swimmer, disciplines))}</Table.Tbody>
      </Table>
      <Space h="md" />
      <Group justify="flex-end">
        <SwimmerAddButton />
      </Group>
    </Paper>
  );
}
