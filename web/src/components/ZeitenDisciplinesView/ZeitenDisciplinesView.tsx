import "./ZeitenDisciplinesView.module.css";
import { Paper, SimpleGrid } from "@mantine/core";
import TableView from "../TableView/TableView.tsx";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Discipline } from "../../model/discipline.ts";
import { formatZeit } from "../../lib/schwimmen/util/zeit.ts";
import React from "react";

export default function ZeitenDisciplinesView() {
  const [disciplines, swimmers] = useStore(useShallow((state) => [state.disciplines, state.swimmers]));

  function paper(discipline: Discipline): React.ReactNode {
    return (
      <Paper shadow="md" withBorder p="xl">
        <h2>{discipline.name}</h2>
        <TableView
          tableData={{
            head: ["Name", "Zeit"],
            body: Array.from(swimmers.values()).map((swimmer) => {
              const seconds = swimmer.disciplineToSeconds.get(discipline.id);
              return [swimmer.name, seconds === undefined ? undefined : formatZeit(seconds)];
            }),
          }}
        />
      </Paper>
    );
  }

  return <SimpleGrid cols={2}>{Array.from(disciplines.values()).map((discipline) => paper(discipline))}</SimpleGrid>;
}
