import { Table, TableData } from "@mantine/core";

export default function TableView({ tableData }: { tableData: TableData }) {
  const rows = tableData.body!.map((row) => (
    <Table.Tr>
      {row.map((cell) => (
        <Table.Td>{cell}</Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <Table data={tableData}>
      <Table.Thead>
        <Table.Tr>
          {tableData.head!.map((header) => (
            <Table.Td>{header}</Table.Td>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
