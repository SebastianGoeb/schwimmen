import { Alert, Checkbox, Container, Group, NativeSelect, NumberInput, Paper, Space, Table } from "@mantine/core";
import React from "react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
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

export default function Swimmers() {
  const [swimmers, updateSwimmer] = useStore(useShallow((state) => [state.swimmers, state.updateSwimmer]));

  const swimmersSorted = Array.from(swimmers.values()).sort(compareByYearThenGenderThenLastname);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(Array(18).keys(), (yearsOld) => String(currentYear - yearsOld));

  function renderRow(swimmer: Swimmer): React.ReactNode {
    //   TODO min/max dynamic
    return (
      <Table.Tr key={swimmer.id}>
        <Table.Td>
          <SwimmerNameInput swimmer={swimmer} />
        </Table.Td>
        <Table.Td>
          <NativeSelect
            style={{ width: "8rem" }}
            data={yearOptions}
            value={swimmer.yearOfBirth}
            onChange={(evt) => updateSwimmer({ ...swimmer, yearOfBirth: Number(evt.currentTarget.value) })}
          />
        </Table.Td>
        <Table.Td>
          <NativeSelect
            style={{ width: "8rem" }}
            data={[Gender.M, Gender.W]}
            value={swimmer.gender}
            onChange={(evt) => updateSwimmer({ ...swimmer, gender: evt.currentTarget.value as Gender })}
          />
        </Table.Td>
        <Table.Td>
          <NumberInput
            style={{ width: "8rem" }}
            min={0}
            max={5}
            placeholder="0-5"
            clampBehavior="strict"
            value={swimmer.minStarts}
            onChange={(value) => updateSwimmer({ ...swimmer, minStarts: numberify(value) })}
          />
        </Table.Td>
        <Table.Td>
          <NumberInput
            style={{ width: "8rem" }}
            min={0}
            max={5}
            placeholder="0-5"
            clampBehavior="strict"
            value={swimmer.maxStarts}
            onChange={(value) => updateSwimmer({ ...swimmer, maxStarts: numberify(value) })}
          />
        </Table.Td>
        <Table.Td>
          <Checkbox
            color="dimmed"
            checked={swimmer.present}
            onChange={(evt) => updateSwimmer({ ...swimmer, present: evt.currentTarget.checked })}
          />
        </Table.Td>
        <Table.Td>
          <SwimmerRemoveButton id={swimmer.id} />
        </Table.Td>
      </Table.Tr>
    );
  }

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
        <Table>
          <Table.Thead>
            <Table.Tr>
              {["Name", "Jahrgang", "Geschlecht", "Min Starts", "Max Starts", "Anwesend"].map((header) => (
                <Table.Th key={header}>{header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{swimmersSorted.map(renderRow)}</Table.Tbody>
        </Table>

        <Space h="md" />
        <Group justify="flex-end">
          <SwimmerAddButton />
        </Group>
      </Paper>
    </Container>
  );
}
