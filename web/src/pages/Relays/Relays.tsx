import {
  ActionIcon,
  Alert,
  Box,
  Button,
  ComboboxItem,
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
import { IconArrowDown, IconArrowUp, IconPlus, IconTrashX } from "@tabler/icons-react";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import React, { useState } from "react";
import { Relay, RelayLeg } from "../../model/relay.ts";
import { useDisclosure } from "@mantine/hooks";
import { Discipline } from "../../model/discipline.ts";

enum ScoringOptions {
  Total = "Gesamtzeit",
  Max = "Langsamste Zeit (Team)",
}

export default function Relays() {
  const [
    relays,
    disciplines,
    addDiscipline,
    removeDiscipline,
    swapDisciplines,
    updateDiscipline,
    addRelay,
    removeRelay,
    updateRelay,
    addRelayLeg,
    removeRelayLeg,
    updateRelayLeg,
  ] = useCombinedStore(
    useShallow((state) => [
      state.relays,
      state.disciplines,
      state.addDiscipline,
      state.removeDiscipline,
      state.swapDisciplines,
      state.updateDiscipline,
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

  const disciplineOptions: ComboboxItem[] = Array.from(disciplines.values(), (discipline) => ({
    value: String(discipline.id),
    label: discipline.name,
  }));

  function renderDiscipline(discipline: Discipline, index: number): React.ReactNode {
    return (
      <Group
        wrap="nowrap"
        justify={"space-between"}
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
        p="xs"
        key={discipline.id}
      >
        <Input
          variant="unstyled"
          value={discipline.name}
          onChange={(evt) => updateDiscipline({ ...discipline, name: evt.currentTarget.value })}
          style={{ flexGrow: 1 }}
        ></Input>
        {index !== 0 ? (
          <ActionIcon variant="subtle" color="var(--mantine-color-text)" onClick={() => swapDisciplines(index - 1)}>
            <IconArrowUp style={{ width: "70%", height: "70%" }} />
          </ActionIcon>
        ) : (
          // no idea, why we can't access --ai-size-md (ActionIcon medium size)
          <Space w="28px" />
        )}

        {index < disciplines.length - 1 ? (
          <ActionIcon variant="subtle" color="var(--mantine-color-text)" onClick={() => swapDisciplines(index)}>
            <IconArrowDown style={{ width: "70%", height: "70%" }} />
          </ActionIcon>
        ) : (
          // no idea, why we can't access --ai-size-md (ActionIcon medium size)
          <Space w="28px" />
        )}

        <ActionIcon variant="subtle" color="red" onClick={() => removeDiscipline(discipline.id)}>
          <IconTrashX />
        </ActionIcon>
      </Group>
    );
  }

  function renderRelayLeg(relay: Relay, relayLeg: RelayLeg, index: number): React.ReactNode {
    const discipline = disciplines.find((d) => d.id === relayLeg.disciplineId);

    if (discipline === undefined) {
      return undefined;
    }

    return (
      <Group wrap="nowrap" key={index}>
        <Select
          style={{ flexShrink: 1, flexGrow: 1 }}
          placeholder="Disziplin..."
          value={String(discipline.id)}
          data={disciplineOptions}
          onChange={(value) => {
            if (value !== null) {
              updateRelayLeg(relay.id, { ...relayLeg, disciplineId: Number(value) }, index);
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
      <h1>Disziplinen</h1>

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

      <Paper shadow="md" withBorder p="xl">
        <Stack gap={0}>
          {Array.from(disciplines.values()).map(renderDiscipline)}

          <Group wrap="nowrap" justify={"space-between"} p="xs">
            <Input
              variant="unstyled"
              style={{ flexGrow: 1 }}
              placeholder="Disziplin..."
              onBlur={(evt) => {
                const value = evt.currentTarget.value;
                if (value.trim() !== "") {
                  addDiscipline({ name: value });
                }
                evt.currentTarget.value = "";
              }}
              onKeyUp={(evt) => {
                if (evt.key === "Enter") {
                  evt.currentTarget.blur();
                }
              }}
            ></Input>
          </Group>
        </Stack>
      </Paper>

      <Space h="xl"></Space>

      <Group justify="space-between">
        <h1>Staffeln</h1>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from(relays.values()).map((relay) => (
          <Paper shadow="md" withBorder key={relay.id}>
            <Stack justify="space-between" style={{ height: "100%" }} py="md" px="xl">
              {/* main content */}
              <Stack>
                <Input
                  styles={(theme) => {
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

                <Group>
                  <Select
                    style={{ flexShrink: 1, flexGrow: 1 }}
                    label="Wertung"
                    data={[ScoringOptions.Total, ScoringOptions.Max]}
                    value={relay.team ? ScoringOptions.Max : ScoringOptions.Total}
                    onChange={(value) => updateRelay({ ...relay, team: value === ScoringOptions.Max })}
                  ></Select>
                  {/* no idea, why we can't access --ai-size-md (ActionIcon medium size) */}
                  <Space w="28px" />
                </Group>

                {/* existing legs */}
                {relay.legs.map((relayLeg, index) => renderRelayLeg(relay, relayLeg, index))}

                {/* new leg */}
                <Group wrap="nowrap">
                  <Select
                    style={{ flexShrink: 1, flexGrow: 1 }}
                    placeholder="Disziplin..."
                    data={disciplineOptions}
                    value=""
                    onChange={(value) => {
                      if (value !== null) {
                        addRelayLeg(relay.id, { disciplineId: Number(value), times: 1 });
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
                color="var(--mantine-color-text)"
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
            <Button variant="outline" color="var(--mantine-color-text)" onClick={closeRemoveModal}>
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
