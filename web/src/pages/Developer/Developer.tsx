import { Alert, Container, Group, NumberInput, Paper, Select, SimpleGrid, Stack } from "@mantine/core";
import DemoDataButton from "../../components/DemoDataButton/DemoDataButton.tsx";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function Developer() {
  const [disziplinen, swimmers, relays] = useCombinedStore(
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

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Paper shadow="md" withBorder py="md" px="xl">
            <h2>Aktionen</h2>
            <DemoDataButton />
          </Paper>

          <Paper withBorder shadow="md" p="xl">
            <h2>Sucheinstellungen</h2>
            <SimpleGrid cols={2}>
              <NumberInput label="Smart Mutation Rate"></NumberInput>
              <NumberInput label="Acceptance Probability"></NumberInput>
              <Select label="Smart Mutation"></Select>
              <Select label="Dumb Mutation"></Select>
              <NumberInput label="Global Generation Limit"></NumberInput>
              <NumberInput label="Restart Generation Limit"></NumberInput>
              <NumberInput label="Max Generations"></NumberInput>
              <NumberInput label="Population Size"></NumberInput>
            </SimpleGrid>
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
            <h2>Staffeln</h2>
            <pre style={{ fontSize: "0.8rem" }}>{JSON.stringify(Array.from(relays.values()), null, 2)}</pre>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
