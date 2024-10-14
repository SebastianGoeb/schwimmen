import { Alert, Checkbox, Container, Group, NativeSelect, NumberInput, Paper, Space, Table } from "@mantine/core";
import React, { useState } from "react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Gender } from "../../model/gender.ts";
import SwimmerRemoveButton from "../../components/SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerAddButton from "../../components/SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerNameInput from "../../components/SwimmerNameInput/SwimmerNameInput.tsx";
import DemoDataButton from "../../components/DemoDataButton/DemoDataButton.tsx";

function numberify(sn: string | number): number | undefined {
  if (typeof sn === "string") {
    return undefined;
  }
  return sn;
}

function byYearThenGenderThenLastname(a: Swimmer, b: Swimmer): number {
  if (a.yearOfBirth !== b.yearOfBirth) {
    return a.yearOfBirth - b.yearOfBirth;
  }

  if (a.gender !== b.gender) {
    // W dann M https://github.com/SebastianGoeb/schwimmen/issues/24
    return b.gender.localeCompare(a.gender);
  }

  const aLastname = a.name.split(" ").reverse()[0] ?? "";
  const bLastname = b.name.split(" ").reverse()[0] ?? "";
  return aLastname.localeCompare(bLastname);
}

function determineOrder(swimmers: Swimmer[]): number[] {
  return [...swimmers].sort(byYearThenGenderThenLastname).map((s) => s.id);
}

export default function Swimmers() {
  const [swimmers, updateSwimmer] = useStore(useShallow((state) => [state.swimmers, state.updateSwimmer]));
  const [order, setOrder] = useState<number[]>(determineOrder(Array.from(swimmers.values())));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(Array(18).keys(), (yearsOld) => String(currentYear - yearsOld));

  function renderRow(swimmer: Swimmer): React.ReactNode[] {
    //   TODO min/max dynamic
    return [
      <SwimmerNameInput
        swimmer={swimmer}
        onBlur={() => {
          setOrder(determineOrder(Array.from(swimmers.values())));
        }}
      />,
      <NativeSelect
        style={{ width: "8rem" }}
        data={yearOptions}
        value={swimmer.yearOfBirth}
        onChange={(evt) => updateSwimmer({ ...swimmer, yearOfBirth: Number(evt.currentTarget.value) })}
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
      <Checkbox
        color="gray"
        checked={swimmer.present}
        onChange={(evt) => updateSwimmer({ ...swimmer, present: evt.currentTarget.checked })}
      />,
      <SwimmerRemoveButton id={swimmer.id} />,
    ];
  }

  const swimmersSorted = order.map((o) => swimmers.get(o)!);
  // swimmersSorted.sort(byYearThenGenderThenLastname);

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Schwimmer</h1>
        <DemoDataButton />
      </Group>

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

      <Paper shadow="md" withBorder p="xl">
        <Table
          data={{
            head: ["Name", "Jahrgang", "Geschlecht", "Min Starts", "Max Starts", "Anwesend"],
            body: swimmersSorted.map(renderRow),
          }}
        ></Table>

        <Space h="md" />
        <Group justify="flex-end">
          <SwimmerAddButton />
        </Group>

        <pre>{JSON.stringify(swimmersSorted, null, 2)}</pre>
      </Paper>
    </Container>
  );
}
