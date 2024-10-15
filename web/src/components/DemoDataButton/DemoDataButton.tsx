import { IconRestore } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { Button, Text } from "@mantine/core";
import { useStore } from "../../services/state.ts";

export default function DemoDataButton() {
  const updateEverything = useStore((state) => state.updateEverything);

  return (
    <Button variant="outline" rightSection={<IconRestore />} onClick={() => updateEverything(demoData1)}>
      Auf Demodaten zurücksetzen
    </Button>
  );
}
