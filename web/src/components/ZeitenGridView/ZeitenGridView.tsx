import "./ZeitenGridView.module.css";
import { Paper } from "@mantine/core";
import TableView from "../TableView/TableView.tsx";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Discipline } from "../../model/discipline.ts";
import { formatZeit } from "../../lib/schwimmen/util/zeit.ts";
import React from "react";

export default function ZeitenGridView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function row(swimmer: Swimmer, disciplines: Map<number, Discipline>): React.ReactNode[] {
    const times = Array.from(disciplines.keys())
      .map((disciplineId) => swimmer.disciplineToSeconds.get(disciplineId))
      .map((seconds) => (seconds !== undefined ? formatZeit(seconds) : undefined));
    return [swimmer.name, ...times];
  }

  return (
    <Paper shadow="md" withBorder p="xl">
      <TableView
        tableData={{
          head: ["Name", ...Array.from(disciplines.values()).map((it) => it.name)],
          body: Array.from(swimmers.values()).map((it) => row(it, disciplines)),
        }}
      />
    </Paper>
  );
}
