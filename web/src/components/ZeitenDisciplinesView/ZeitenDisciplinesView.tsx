import "./ZeitenDisciplinesView.module.css";
import { Group, Paper, SimpleGrid, Space, Table } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Discipline } from "../../model/discipline.ts";
import React from "react";
import { Swimmer } from "../../model/swimmer.ts";
import ZeitenCell from "../ZeitenCell/ZeitenCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";

export default function ZeitenDisciplinesView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function renderDiscipline(discipline: Discipline): React.ReactNode {
    return (
      <Paper shadow="md" withBorder p="xl" key={discipline.id}>
        <h2>{discipline.name}</h2>
        <Table
          data={{
            head: ["Name", "Zeit"],
            body: Array.from(swimmers.values()).map((swimmer) => renderRow(swimmer, discipline)),
          }}
        />
        <Space h="md" />
        <Group justify="flex-end">
          <SwimmerAddButton />
        </Group>
      </Paper>
    );
  }

  function renderRow(swimmer: Swimmer, discipline: Discipline): React.ReactNode[] {
    return [
      swimmer.name,
      <ZeitenCell swimmer={swimmer} disciplineId={discipline.id} />,
      <SwimmerRemoveButton id={swimmer.id} />,
    ];
  }

  return (
    <SimpleGrid cols={2}>
      {Array.from(disciplines.values()).map((discipline) => renderDiscipline(discipline))}
    </SimpleGrid>
  );
}
