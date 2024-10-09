import "./Zeiten.module.css";
import { Button, Container, Group, SegmentedControl } from "@mantine/core";
import { IconPresentation } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { demoData1 } from "../../demo/data.ts";
import { useShallow } from "zustand/react/shallow";
import ZeitenGridView from "../../components/ZeitenGridView/ZeitenGridView.tsx";
import { useState } from "react";
import ZeitenDisciplinesView from "../../components/ZeitenDisciplinesView/ZeitenDisciplinesView.tsx";

enum View {
  Grid = "Raster",
  Disciplines = "Disziplinen",
}

export default function Zeiten() {
  const [updateEverything] = useStore(useShallow((state) => [state.updateEverything]));

  const [view, setView] = useState<string>(View.Grid);

  function importDemoData() {
    updateEverything(demoData1);
  }

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Zeiten</h1>
        <Group>
          Ansicht
          <SegmentedControl onChange={setView} data={[View.Grid, View.Disciplines]} />
          <Button rightSection={<IconPresentation />} onClick={importDemoData}>
            Demodaten nutzen
          </Button>
        </Group>
      </Group>

      {view === View.Grid ? <ZeitenGridView /> : <ZeitenDisciplinesView />}
    </Container>
  );
}
