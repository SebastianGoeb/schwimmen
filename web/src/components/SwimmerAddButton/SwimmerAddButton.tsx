import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function SwimmerAddButton() {
  const [addSwimmer] = useCombinedStore(useShallow((state) => [state.addSwimmer]));

  return (
    <Button radius="xl" leftSection={<IconPlus />} variant="outline" onClick={addSwimmer}>
      Schwimmer
    </Button>
  );
}
