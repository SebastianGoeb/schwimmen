import {
  Alert,
  Button,
  Checkbox,
  Container,
  FileButton,
  Group,
  NativeSelect,
  NumberInput,
  Paper,
  ScrollArea,
  Space,
  Table,
} from "@mantine/core";
import React from "react";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { compareByYearThenGenderThenLastname, LapTime, Swimmer } from "../../model/swimmer.ts";
import { Gender } from "../../model/gender.ts";
import SwimmerRemoveButton from "../../components/SwimmerRemoveButton/SwimmerRemoveButton.tsx";
import SwimmerAddButton from "../../components/SwimmerAddButton/SwimmerAddButton.tsx";
import SwimmerNameInput from "../../components/SwimmerNameInput/SwimmerNameInput.tsx";
import { IconFileSpreadsheet } from "@tabler/icons-react";

import { read, utils } from "xlsx";
import { readFileAsArrayBuffer } from "../../utils/file.ts";
import { formatMaskedTime } from "../../utils/masking.ts";

function numberify(sn: string | number): number | undefined {
  if (typeof sn === "string") {
    return undefined;
  }
  return sn;
}

export default function Swimmers() {
  const [swimmers, disciplines, updateSwimmer, replaceAllSwimmers] = useCombinedStore(
    useShallow((state) => [state.swimmers, state.disciplines, state.updateSwimmer, state.replaceAllSwimmers]),
  );

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

  async function processFile(file: File | null) {
    if (file) {
      const arraybuffer = await readFileAsArrayBuffer(file);
      const workbook = read(arraybuffer);
      console.log(workbook);

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(sheet);
      const swimmers = data.map((row, idx) => toSwimmer(idx, row));
      replaceAllSwimmers(swimmers);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toSwimmer(idx: number, row: any): Swimmer {
    const id = idx + 1;
    const { __EMPTY, __EMPTY_1, __EMPTY_2, ...times } = row;

    const lapTimes = new Map<number, LapTime>();
    for (const [disciplineName, time] of Object.entries(times)) {
      const seconds = (time as number) * 24 * 3600;
      const secondsRounded = parseFloat(seconds.toFixed(2));
      const disciplineId = disciplines.find((d) => d.name === disciplineName)!.id;
      lapTimes.set(disciplineId, {
        seconds: formatMaskedTime(secondsRounded),
        enabled: true,
      });
    }

    return {
      id,
      name: __EMPTY as string,
      present: true,
      gender: toGender(__EMPTY_1 as string),
      yearOfBirth: __EMPTY_2,
      lapTimes,
    };
  }

  function toGender(s: string): Gender {
    const lower = s.toLowerCase();
    if (lower === "m") {
      return Gender.M;
    } else if (lower === "w") {
      return Gender.W;
    } else {
      throw new Error("Geschlecht konnte nicht gelesen werden: " + s);
    }
  }

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Schwimmer</h1>
        <FileButton onChange={processFile} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
          {(props) => (
            <Button {...props} leftSection={<IconFileSpreadsheet />}>
              Excel importieren
            </Button>
          )}
        </FileButton>
      </Group>

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

      <Paper shadow="md" withBorder p="xl">
        <ScrollArea>
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
        </ScrollArea>
      </Paper>
    </Container>
  );
}
