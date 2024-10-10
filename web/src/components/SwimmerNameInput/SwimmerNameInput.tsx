import { TextInput } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";

export default function SwimmerNameInput({ swimmer }: { swimmer: Swimmer }) {
  const [updateSwimmer] = useStore(useShallow((state) => [state.updateSwimmer]));

  return (
    <TextInput
      variant="unstyled"
      placeholder="ich heiße..."
      value={swimmer.name}
      onChange={(evt) => updateSwimmer({ ...swimmer, name: evt.currentTarget.value })}
    ></TextInput>
  );
}
