import { IconRestore } from "@tabler/icons-react";
import { demoData1 } from "../../demo/data.ts";
import { Button } from "@mantine/core";
import { useStore } from "../../services/state.ts";

export default function DemoDataButton() {
  const updateEverything = useStore((state) => state.updateEverything);

  return (
    <Button leftSection={<IconRestore />} onClick={() => updateEverything(demoData1)}>
      Auf Demodaten zurücksetzen
    </Button>
  );
}
