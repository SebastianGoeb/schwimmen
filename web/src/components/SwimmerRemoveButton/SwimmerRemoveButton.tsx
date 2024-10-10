import { ActionIcon, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconTrashX } from "@tabler/icons-react";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { useDisclosure } from "@mantine/hooks";

export default function SwimmerRemoveButton({ id }: { id: number }) {
  const [removeSwimmer] = useStore(useShallow((state) => [state.removeSwimmer]));
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ActionIcon color="red" variant="subtle" onClick={open}>
        <IconTrashX />
      </ActionIcon>
      <Modal centered opened={opened} onClose={close} title="Schwimmer Löschen">
        <Stack>
          <Text>Möchten Sie den Schwimmer, sowie alle seine Zeiten und Einstellungen komplett entfernen?</Text>
          <Group justify="flex-end">
            <Button variant="outline" color="black" onClick={close}>
              Abbrechen
            </Button>
            <Button
              color="red"
              onClick={async () => {
                close();
                // If we don't wait, the modal itself is deleted immediately and there is no close animation.
                // This way, we wait for the animation to (mostly) finish, then delete. The alternative would be
                // a reconfigurable standalone modal that survives swimmer deletion, but that's more complicated.
                await new Promise((resolve) => setTimeout(resolve, 100));
                removeSwimmer(id);
              }}
            >
              Löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
