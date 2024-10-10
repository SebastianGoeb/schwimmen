import "./ZeitenGridView.module.css";
import { Group, Paper, Space, Table } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Discipline } from "../../model/discipline.ts";
import React from "react";
import ZeitenCell from "../ZeitenCell/ZeitenCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";

export default function ZeitenGridView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function renderRow(swimmer: Swimmer, disciplines: Map<number, Discipline>): React.ReactNode[] {
    const cells = Array.from(disciplines.keys()).map((disciplineId) => (
      <ZeitenCell swimmer={swimmer} disciplineId={disciplineId} />
    ));
    return [swimmer.name, ...cells, <SwimmerRemoveButton id={swimmer.id} />];
  }

  return (
    <Paper shadow="md" withBorder p="xl">
      <Table
        data={{
          head: ["Name", ...Array.from(disciplines.values()).map((it) => it.name)],
          body: Array.from(swimmers.values()).map((it) => renderRow(it, disciplines)),
        }}
      />
      <Space h="md" />
      <Group justify="flex-end">
        <SwimmerAddButton />
      </Group>
    </Paper>
  );
}
