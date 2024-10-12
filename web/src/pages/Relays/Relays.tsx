import { Button, Container, Group, Paper, Stack } from "@mantine/core";
import { IconPresentation } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function Relays() {
  const [relays, disciplines, updateEverything] = useStore(
    useShallow((state) => [state.relays, state.disciplines, state.updateEverything]),
  );

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Staffeln</h1>
        <Button rightSection={<IconPresentation />} onClick={() => updateEverything(demoData1)}>
          Demodaten nutzen
        </Button>
      </Group>

      <Stack gap={"1rem"}>
        {Array.from(relays.values()).map((relay) => (
          <Paper shadow="md" withBorder p="xl">
            <h2>{relay.name}</h2>
            <ul>
              {Array.from(relay.disciplines.entries()).map(([disciplineId, times]) => (
                <li>
                  {times}x {disciplines.get(disciplineId)?.name}
                </li>
              ))}
            </ul>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
