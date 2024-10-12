import { Button, Container, Group, Paper } from "@mantine/core";
import { IconPresentation } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function Relays() {
  const [updateEverything] = useStore(useShallow((state) => [state.updateEverything]));

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Staffeln</h1>
        <Button rightSection={<IconPresentation />} onClick={() => updateEverything(demoData1)}>
          Demodaten nutzen
        </Button>
      </Group>

      <Paper shadow="md" withBorder p="xl">
        <p>Hier kommt bald was.</p>
      </Paper>
    </Container>
  );
}
