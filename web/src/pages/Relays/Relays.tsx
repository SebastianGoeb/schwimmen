import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Input,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Space,
  Stack,
} from "@mantine/core";
import { IconPlus, IconPresentation, IconTrashX } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import React from "react";

export default function Relays() {
  const [relays, disciplines, updateEverything, addRelay, updateRelay, removeRelay] = useStore(
    useShallow((state) => [
      state.relays,
      state.disciplines,
      state.updateEverything,
      state.addRelay,
      state.updateRelay,
      state.removeRelay,
    ]),
  );

  function renderRow(disciplineId: number, times: number): React.ReactNode {
    return (
      <Group wrap="nowrap">
        <Select
          style={{ flexShrink: 1, flexGrow: 1 }}
          placeholder="Disziplin..."
          // TODO no !
          value={disciplines.get(disciplineId)!.name}
          data={Array.from(disciplines.values()).map((discipline) => discipline.name)}
        />
        <NumberInput min={1} placeholder="1..." value={times} style={{ flexShrink: 2, flexGrow: 1 }} />
        <ActionIcon variant="subtle" color="red">
          <IconTrashX />
        </ActionIcon>
      </Group>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Staffeln</h1>
        <Button rightSection={<IconPresentation />} onClick={() => updateEverything(demoData1)}>
          Demodaten nutzen
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from(relays.values()).map((relay) => (
          <Paper shadow="md" withBorder>
            <Stack justify="space-between" style={{ height: "100%" }} py="md" px="xl">
              {/* main content */}
              <Stack>
                <Input
                  styles={(theme) => {
                    console.log("h2 font weight", theme.headings.sizes);
                    return {
                      input: {
                        fontWeight: 700,
                        fontSize: theme.headings.sizes.h2.fontSize,
                        lineHeight: theme.headings.sizes.h2.lineHeight,
                      },
                    };
                  }}
                  variant="unstyled"
                  placeholder="Staffel..."
                  value={relay.name}
                  onChange={(evt) => {
                    updateRelay({ ...relay, name: evt.currentTarget.value });
                  }}
                ></Input>

                {/* existing entries */}
                {Array.from(relay.disciplines.entries(), ([disciplineId, times]) => renderRow(disciplineId, times))}

                {/* new entry */}
                <Group wrap="nowrap">
                  <Select
                    style={{ flexShrink: 1, flexGrow: 1 }}
                    placeholder="Disziplin..."
                    data={Array.from(disciplines.values(), (discipline) => discipline.name)}
                  />
                  <NumberInput disabled min={1} placeholder="1..." style={{ flexShrink: 2, flexGrow: 1 }} />
                  {/* no idea, why we can't access --ai-size-md (ActionIcon medium size) */}
                  <Space w="28px" />
                </Group>
              </Stack>

              <Space h="1rem" />

              {/* bottom buttons */}
              <Button
                variant="subtle"
                color="black"
                style={{ alignSelf: "flex-end" }}
                onClick={() => removeRelay(relay.id)}
              >
                Staffel löschen
              </Button>
            </Stack>
          </Paper>
        ))}

        {/* new relay pseudo-card */}
        <Box style={{ minHeight: "100%" }}>
          <Button
            size="xl"
            leftSection={<IconPlus />}
            variant="outline"
            style={{ minHeight: "12rem", height: "100%", width: "100%" }}
            onClick={addRelay}
          >
            Staffel
          </Button>
        </Box>
      </SimpleGrid>
    </Container>
  );
}
