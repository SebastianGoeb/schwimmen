import { Alert, Container, Group, SegmentedControl, Space } from "@mantine/core";
import LapTimeGridView from "../../components/LapTimeGridView/LapTimeGridView.tsx";
import { useState } from "react";
import LapTimeDisciplinesView from "../../components/LapTimeDisciplinesView/LapTimeDisciplinesView.tsx";
import DemoDataButton from "../../components/DemoDataButton/DemoDataButton.tsx";

enum View {
  Grid = "Raster",
  Disciplines = "Disziplinen",
}

export default function LapTimes() {
  const [view, setView] = useState<string>(View.Grid);

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Zeiten</h1>
        <Group>
          Ansicht
          <SegmentedControl onChange={setView} data={[View.Grid, View.Disciplines]} />
          <DemoDataButton />
        </Group>
      </Group>

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

      {view === View.Grid ? <LapTimeGridView /> : <LapTimeDisciplinesView />}
    </Container>
  );
}
