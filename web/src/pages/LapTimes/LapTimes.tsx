import {
  Alert,
  Button,
  ComboboxItem,
  Container,
  Divider,
  Group,
  Modal,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import LapTimeGridView from "../../components/LapTimeGridView/LapTimeGridView.tsx";
import { useEffect, useMemo, useState } from "react";
import LapTimeDisciplinesView from "../../components/LapTimeDisciplinesView/LapTimeDisciplinesView.tsx";
import { IconClipboardPlus } from "@tabler/icons-react";
import { parseStilZeitenFromGrid, Schwimmer } from "../../lib/schwimmen/eingabe/zeiten.ts";
import { useDisclosure } from "@mantine/hooks";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { Discipline } from "../../model/discipline.ts";
import { uniq } from "lodash-es";

enum View {
  Grid = "Raster",
  Disciplines = "Disziplinen",
}

interface LapTimeImportModalProps {
  opened: boolean;
  onClose: () => void;
  importedSchwimmer: Schwimmer[];
}

function getInitialSwimmerNameToIdMapping(
  swimmers: Map<number, Swimmer>,
  importedSchwimmer: Schwimmer[],
): Map<string, number> {
  const swimmersArray = Array.from(swimmers.values());
  return new Map(
    importedSchwimmer.map((imported) => [imported.name, swimmersArray.find((s) => s.name === imported.name)?.id ?? -1]),
  );
}

function getInitialDiscipineNameToIdMapping(
  disciplines: Discipline[],
  importedDiscplines: string[],
): Map<string, number> {
  return new Map(importedDiscplines.map((name) => [name, disciplines.find((d) => d.name === name)?.id ?? -1]));
}

function LapTimeImportModal(props: LapTimeImportModalProps) {
  const [swimmers, disciplines, importLapTimes] = useStore(
    useShallow((state) => [state.swimmers, state.disciplines, state.importLapTimes]),
  );
  const importedDisciplines: string[] = useMemo(() => {
    return uniq(props.importedSchwimmer.flatMap((swimmer) => [...swimmer.zeitenSeconds.keys()]));
  }, [props.importedSchwimmer]);
  const [swimmerNameToId, setSwimmerNameToId] = useState<Map<string, number>>(
    getInitialSwimmerNameToIdMapping(swimmers, props.importedSchwimmer),
  );
  useEffect(
    () => setSwimmerNameToId(getInitialSwimmerNameToIdMapping(swimmers, props.importedSchwimmer)),
    [swimmers, props.importedSchwimmer],
  );
  const [disciplineNameToId, setDiscipineNameToId] = useState<Map<string, number>>(
    getInitialDiscipineNameToIdMapping(disciplines, importedDisciplines),
  );
  useEffect(
    () => setDiscipineNameToId(getInitialDiscipineNameToIdMapping(disciplines, importedDisciplines)),
    [disciplines, importedDisciplines],
  );

  const swimmerMappingOptions: ComboboxItem[] = [
    ...Array.from(swimmers.values(), (s) => ({ value: String(s.id), label: s.name })),
    { value: "-1", label: "(neu anlegen)" },
  ];

  const disciplineMappingOptions: ComboboxItem[] = [
    ...Array.from(disciplines.values(), (s) => ({ value: String(s.id), label: s.name })),
    { value: "-1", label: "(neu anlegen)" },
  ];

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title="Zeiten Importieren"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack>
        <h3>Folgende Schwimmer wurden gefunden</h3>
        <SimpleGrid cols={2}>
          {props.importedSchwimmer.map((schwimmer) => (
            <>
              <Text>{schwimmer.name}</Text>
              <Select
                data={swimmerMappingOptions}
                value={String(swimmerNameToId.get(schwimmer.name)!)}
                onChange={(value) => {
                  setSwimmerNameToId(new Map(swimmerNameToId).set(schwimmer.name, value !== null ? Number(value) : -1));
                }}
              />
            </>
          ))}
        </SimpleGrid>
        <Divider />

        <h3>Folgende Disziplinen wurden gefunden</h3>
        <SimpleGrid cols={2}>
          {importedDisciplines.map((name) => (
            <>
              <Text>{name}</Text>
              <Select
                data={disciplineMappingOptions}
                value={String(disciplineNameToId.get(name)!)}
                onChange={(value) => {
                  setDiscipineNameToId(new Map(disciplineNameToId).set(name, value !== null ? Number(value) : -1));
                }}
              />
            </>
          ))}
        </SimpleGrid>
        <Group justify="flex-end">
          <Button variant="subtle" color="dimmed" onClick={props.onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              importLapTimes({ importedSchwimmer: props.importedSchwimmer, swimmerNameToId, disciplineNameToId });
              props.onClose();
            }}
          >
            Importieren
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function LapTimes() {
  const [view, setView] = useState<string>(View.Grid);
  const [importReconciliationOpened, { open: openImportReconciliation, close: closeImportReconciliation }] =
    useDisclosure(false);
  const [importedSchwimmer, setImportedSchwimmer] = useState<Schwimmer[]>([]);

  async function importLapTimes() {
    const text = await navigator.clipboard.readText();
    const grid = text.split("\n").map((row) => row.split("\t"));
    const schwimmer = parseStilZeitenFromGrid(grid);
    setImportedSchwimmer(schwimmer);
    openImportReconciliation();
  }

  return (
    <Container size="xl">
      <Group justify="space-between">
        <h1>Zeiten</h1>
        <Group>
          Ansicht
          <SegmentedControl onChange={setView} data={[View.Grid, View.Disciplines]} />
          <Button leftSection={<IconClipboardPlus />} onClick={() => importLapTimes()}>
            aus Zwischenablage importieren
          </Button>
        </Group>
      </Group>

      <Alert variant="light" color="orange" title="Achtung">
        Die Applikation ist noch unfertig, insbesondere gibt es keine Speicherung. Bitte nicht zu viele Echtdaten
        eingeben, da diese verloren gehen.
      </Alert>
      <Space h="md"></Space>

      {view === View.Grid ? <LapTimeGridView /> : <LapTimeDisciplinesView />}

      <LapTimeImportModal
        opened={importReconciliationOpened}
        onClose={closeImportReconciliation}
        importedSchwimmer={importedSchwimmer}
      />
    </Container>
  );
}
