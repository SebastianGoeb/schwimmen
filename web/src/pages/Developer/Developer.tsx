import { Alert, Container, Group, Paper, Stack } from "@mantine/core";
import DemoDataButton from "../../components/DemoDataButton/DemoDataButton.tsx";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import React from "react";

export default function Developer() {
  const [disziplinen, swimmers, relays] = useStore(
    useShallow((state) => [state.disciplines, state.swimmers, state.relays]),
  );

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Entwicklerbereich</h1>
      </Group>

      <Stack>
        <Alert variant="light" color="orange" title="Achtung">
          Hier bitte nur klicken, wenn Sie wissen, was Sie tun.
        </Alert>
        <Paper shadow="md" withBorder py="md" px="xl">
          <h2>Aktionen</h2>
          <DemoDataButton />
        </Paper>

        <Paper shadow="md" withBorder py="md" px="xl">
          <h2>Disziplinen</h2>
          <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(disziplinen, null, 2)}</pre>
        </Paper>

        <Paper shadow="md" withBorder py="md" px="xl">
          <h2>Schwimmer</h2>
          <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(Array.from(swimmers.values()), null, 2)}</pre>
        </Paper>

        <Paper shadow="md" withBorder py="md" px="xl">
          <h2>Disziplinen</h2>
          <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(Array.from(relays.values()), null, 2)}</pre>
        </Paper>
      </Stack>
    </Container>
  );
}
