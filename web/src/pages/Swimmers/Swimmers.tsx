import { Button, Checkbox, Container, Group, NativeSelect, NumberInput, Paper, Space, Table } from "@mantine/core";
import React from "react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Gender } from "../../model/gender.ts";
import { IconPresentation } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import SwimmerRemoveButton from "../../components/SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerAddButton from "../../components/SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerNameInput from "../../components/SwimmerNameInput/SwimmerNameInput.tsx";

function numberify(sn: string | number): number | undefined {
  if (typeof sn === "string") {
    return undefined;
  }
  return sn;
}

export default function Swimmers() {
  const [swimmers, updateEverything, updateSwimmer] = useStore(
    useShallow((state) => [state.swimmers, state.updateEverything, state.updateSwimmer]),
  );

  function renderRow(swimmer: Swimmer): React.ReactNode[] {
    //   TODO min/max dynamic
    return [
      <SwimmerNameInput swimmer={swimmer} />,
      <Checkbox
        color="gray"
        checked={swimmer.present}
        onChange={(evt) => updateSwimmer({ ...swimmer, present: evt.currentTarget.checked })}
      />,
      <NativeSelect
        style={{ width: "8rem" }}
        data={[Gender.M, Gender.W]}
        value={swimmer.gender}
        onChange={(evt) => updateSwimmer({ ...swimmer, gender: evt.currentTarget.value as Gender })}
      />,
      <NumberInput
        style={{ width: "8rem" }}
        min={0}
        max={5}
        placeholder="0-5"
        clampBehavior="strict"
        value={swimmer.minStarts}
        onChange={(value) => updateSwimmer({ ...swimmer, minStarts: numberify(value) })}
      />,
      <NumberInput
        style={{ width: "8rem" }}
        min={0}
        max={5}
        placeholder="0-5"
        clampBehavior="strict"
        value={swimmer.maxStarts}
        onChange={(value) => updateSwimmer({ ...swimmer, maxStarts: numberify(value) })}
      />,
      <SwimmerRemoveButton id={swimmer.id} />,
    ];
  }

  return (
    <Container size="md">
      <Group justify="space-between">
        <h1>Schwimmer</h1>
        <Button rightSection={<IconPresentation />} onClick={() => updateEverything(demoData1)}>
          Demodaten nutzen
        </Button>
      </Group>

      <Paper shadow="md" withBorder p="xl">
        <Table
          data={{
            head: ["Name", "Anwesend", "Geschlecht", "Min Starts", "Max Starts"],
            body: Array.from(swimmers.values()).map(renderRow),
          }}
        ></Table>

        <Space h="md" />
        <Group justify="flex-end">
          <SwimmerAddButton />
        </Group>
      </Paper>
    </Container>
  );
}
