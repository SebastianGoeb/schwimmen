import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Container,
  Group,
  Input,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus, IconPresentation, IconTrashX } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import React, { useState } from "react";
import { Relay, RelayLeg } from "../../model/relay.ts";
import { useDisclosure } from "@mantine/hooks";
import { showProgrammingErrorNotification } from "../../utils/notifications.ts";

export default function Relays() {
  const [
    relays,
    disciplines,
    updateEverything,
    addRelay,
    removeRelay,
    updateRelay,
    addRelayLeg,
    removeRelayLeg,
    updateRelayLeg,
  ] = useStore(
    useShallow((state) => [
      state.relays,
      state.disciplines,
      state.updateEverything,
      state.addRelay,
      state.removeRelay,
      state.updateRelay,
      state.addRelayLeg,
      state.removeRelayLeg,
      state.updateRelayLeg,
    ]),
  );

  const [relayPendingRemoval, setRelayPendingRemoval] = useState<Relay | undefined>(undefined);
  const [removeModalOpened, { open: openRemoveModal, close: closeRemoveModal }] = useDisclosure(false);

  function findDisciplineId(disciplineName: string): number | undefined {
    return Array.from(disciplines.values()).find((d) => d.name === disciplineName)?.id;
  }

  function renderRow(relay: Relay, relayLeg: RelayLeg, index: number): React.ReactNode {
    const discipline = disciplines.get(relayLeg.disciplineId);

    if (discipline === undefined) {
      return undefined;
    }

    return (
      <Group wrap="nowrap">
        <Select
          style={{ flexShrink: 1, flexGrow: 1 }}
          placeholder="Disziplin..."
          value={discipline.name}
          data={Array.from(disciplines.values()).map((discipline) => discipline.name)}
          onChange={(value) => {
            if (value !== null) {
              const disciplineId = findDisciplineId(value);
              if (disciplineId === undefined) {
                showProgrammingErrorNotification();
                return;
              }
              updateRelayLeg(relay.id, { ...relayLeg, disciplineId }, index);
            }
          }}
        />
        <NumberInput
          style={{ flexShrink: 2, flexGrow: 1 }}
          min={1}
          placeholder="1..."
          value={relayLeg.times}
          onChange={(value) => {
            if (typeof value === "number") {
              updateRelayLeg(relay.id, { ...relayLeg, times: value }, index);
            }
          }}
        />
        <ActionIcon variant="subtle" color="red" onClick={() => removeRelayLeg(relay.id, index)}>
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

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

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

                {/* existing legs */}
                {relay.legs.map((relayLeg, index) => renderRow(relay, relayLeg, index))}

                {/* new leg */}
                <Group wrap="nowrap">
                  <Select
                    style={{ flexShrink: 1, flexGrow: 1 }}
                    placeholder="Disziplin..."
                    data={Array.from(disciplines.values(), (discipline) => discipline.name)}
                    value={""}
                    onChange={(value) => {
                      if (value !== null) {
                        const disciplineId = findDisciplineId(value);
                        if (disciplineId === undefined) {
                          showProgrammingErrorNotification();
                          return;
                        }
                        addRelayLeg(relay.id, { disciplineId, times: 1 });
                      }
                    }}
                  />
                  <NumberInput disabled min={1} placeholder="1..." style={{ flexShrink: 2, flexGrow: 1 }} />
                  {/* no idea, why we can't access --ai-size-md (ActionIcon medium size) */}
                  <Space w="28px" />
                </Group>
              </Stack>

              {/* bottom buttons */}
              <Space h="1rem" />
              <Button
                variant="subtle"
                color="black"
                style={{ alignSelf: "flex-end" }}
                onClick={() => {
                  setRelayPendingRemoval(relay);
                  openRemoveModal();
                }}
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

      <Modal centered opened={removeModalOpened} onClose={closeRemoveModal} title="Staffel Löschen">
        <Stack>
          <Text>Möchten Sie die Staffel "{relayPendingRemoval?.name}" komplett entfernen?</Text>
          <Group justify="flex-end">
            <Button variant="outline" color="black" onClick={closeRemoveModal}>
              Abbrechen
            </Button>
            <Button
              color="red"
              onClick={async () => {
                closeRemoveModal();
                removeRelay(relayPendingRemoval!.id);
              }}
            >
              Löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
