import { Group, Paper, Space, Table } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Discipline } from "../../model/discipline.ts";
import React from "react";
import LapTimeCell from "../LapTimeCell/LapTimeCell.tsx";
import SwimmerAddButton from "../SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerRemoveButton from "../SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerNameInput from "../SwimmerNameInput/SwimmerNameInput.tsx";

export default function LapTimeGridView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function renderRow(swimmer: Swimmer, disciplines: Map<number, Discipline>): React.ReactNode[] {
    const cells = Array.from(disciplines.keys()).map((disciplineId) => (
      <LapTimeCell swimmer={swimmer} disciplineId={disciplineId} />
    ));
    return [<SwimmerNameInput swimmer={swimmer} />, ...cells, <SwimmerRemoveButton id={swimmer.id} />];
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
