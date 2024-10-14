import { TextInput } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";

export interface SwimmerNameInputProps {
  swimmer: Swimmer;
  onBlur?: () => void;
}

export default function SwimmerNameInput({ swimmer, onBlur }: SwimmerNameInputProps) {
  const [updateSwimmer] = useStore(useShallow((state) => [state.updateSwimmer]));

  return (
    <TextInput
      variant="unstyled"
      placeholder="ich heiße..."
      value={swimmer.name}
      onChange={(evt) => updateSwimmer({ ...swimmer, name: evt.currentTarget.value })}
      onBlur={onBlur}
    ></TextInput>
  );
}
