import { Button, Container, Group, SegmentedControl } from "@mantine/core";
import { IconPresentation } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { demoData1 } from "../../demo/data.ts";
import { useShallow } from "zustand/react/shallow";
import LapTimeGridView from "../../components/LapTimeGridView/LapTimeGridView.tsx";
import { useState } from "react";
import LapTimeDisciplinesView from "../../components/LapTimeDisciplinesView/LapTimeDisciplinesView.tsx";

enum View {
  Grid = "Raster",
  Disciplines = "Disziplinen",
}

export default function LapTimes() {
  const [updateEverything] = useStore(useShallow((state) => [state.updateEverything]));

  const [view, setView] = useState<string>(View.Grid);

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Zeiten</h1>
        <Group>
          Ansicht
          <SegmentedControl onChange={setView} data={[View.Grid, View.Disciplines]} />
          <Button rightSection={<IconPresentation />} onClick={() => updateEverything(demoData1)}>
            Demodaten nutzen
          </Button>
        </Group>
      </Group>

      {view === View.Grid ? <LapTimeGridView /> : <LapTimeDisciplinesView />}
    </Container>
  );
}
