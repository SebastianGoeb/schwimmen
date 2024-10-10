import { ActionIcon } from "@mantine/core";
import { IconTrashX } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";

export default function SwimmerRemoveButton({ id }: { id: number }) {
  const [removeSwimmer] = useStore(useShallow((state) => [state.removeSwimmer]));

  return (
    <ActionIcon color="red" variant="subtle" onClick={() => removeSwimmer(id)}>
      <IconTrashX />
    </ActionIcon>
  );
}
