import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function SwimmerAddButton() {
  const [addSwimmer] = useStore(useShallow((state) => [state.addSwimmer]));

  return (
    <Button radius="xl" leftSection={<IconPlus />} variant="outline" onClick={addSwimmer}>
      Schwimmer
    </Button>
  );
}
