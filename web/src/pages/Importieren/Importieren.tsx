import "./Importieren.module.css";
import { Button, Container, Group, Paper, SimpleGrid, Space, TableData, Tabs } from "@mantine/core";
import { IconClipboardData } from "@tabler/icons-react";
import TableView from "../../components/TableView/TableView.tsx";
import { useState } from "react";
import { Konfiguration } from "../../lib/schwimmen/eingabe/konfiguration.ts";
import { parseSheet } from "../../lib/schwimmen/eingabe/sheet.ts";
import { isError } from "../../lib/schwimmen/util/error.ts";
import { sortBy } from "lodash-es";
import { formatZeit } from "../../lib/schwimmen/util/zeit.ts";

const placeholderTableData: TableData = {
  head: ["Disziplin", "Zeit"],
  body: [],
};

function schwimmerListToTableData(data: Konfiguration): TableData[] {
  return data.disziplinToSchwimmerToZeit.map((row, disziplinId) => ({
    head: [disziplinId, "Zeit"],
    body: sortBy(
      row.map((zeit, schwimmerId) => [
        data.schwimmerList[schwimmerId].name,
        zeit !== undefined ? formatZeit(zeit) : null,
      ]),
      (x) => x[0],
    ),
  }));
}

export default function Importieren() {
  const [data, setData] = useState<Konfiguration | undefined>(undefined);

  async function importFromClipboard() {
    const text = await navigator.clipboard.readText();
    const sheet = text.split("\n").map((row) => row.split("\t"));
    const parsed = parseSheet(sheet);
    if (isError(parsed)) {
      console.error(parsed.errors);
      return;
    }
    setData(parsed.konfiguration);
  }

  return (
    <Container size="md">
      <Group justify={"space-between"}>
        <h1>Importieren</h1>
        <Group>
          <Button rightSection={<IconClipboardData />} onClick={importFromClipboard}>
            Aus Zwischenablage importieren
          </Button>
          {/*<Button rightSection={<IconCheck />}>Übernehmen</Button>*/}
        </Group>
      </Group>

      <Tabs defaultValue="zeiten">
        <Tabs.List>
          <Tabs.Tab value="zeiten">Zeiten</Tabs.Tab>
          <Tabs.Tab value="schwimmer">Schwimmer</Tabs.Tab>
          <Tabs.Tab value="staffeln">Staffeln</Tabs.Tab>
        </Tabs.List>

        <Space h="md" />

        <Tabs.Panel value="zeiten">
          <SimpleGrid cols={2}>
            {/*<Stack gap={28}>*/}
            {(data === undefined ? [placeholderTableData, placeholderTableData] : schwimmerListToTableData(data)).map(
              (t) => (
                <Paper shadow="sm" withBorder p="xl">
                  <TableView tableData={t} />
                </Paper>
              ),
            )}
            {/*</Stack>*/}
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="schwimmer">
          <Paper shadow="md" withBorder p="xl"></Paper>
        </Tabs.Panel>
        <Tabs.Panel value="staffeln">
          <Paper shadow="md" withBorder p="xl"></Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
