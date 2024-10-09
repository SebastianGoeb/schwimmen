import "./Zeiten.module.css";
import { Button, Container, Group, Paper } from "@mantine/core";
import { IconDatabaseImport } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { demoData1 } from "../../demo/data.ts";
import { useShallow } from "zustand/react/shallow";

export default function Zeiten() {
  const [swimmers, updateEverything] = useStore(useShallow((state) => [state.swimmers, state.updateEverything]));

  function importDemoData() {
    updateEverything(demoData1);
  }

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Zeiten</h1>
        <Button rightSection={<IconDatabaseImport />} onClick={importDemoData}>
          Demodaten nutzen
        </Button>
      </Group>

      <Paper shadow="md" withBorder p="xl">
        <pre>{JSON.stringify(Array.from(swimmers.entries()), null, 2)}</pre>
      </Paper>
    </Container>
  );
}
