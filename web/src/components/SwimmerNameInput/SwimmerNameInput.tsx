import { TextInput } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { useState } from "react";

export interface SwimmerNameInputProps {
  swimmer: Swimmer;
}

export default function SwimmerNameInput({ swimmer }: SwimmerNameInputProps) {
  const [updateSwimmer] = useStore(useShallow((state) => [state.updateSwimmer]));
  const [value, setValue] = useState(swimmer.name);

  return (
    <TextInput
      style={{ minWidth: "8rem" }}
      variant="unstyled"
      placeholder="ich heiße..."
      value={value}
      onChange={(evt) => setValue(evt.target.value)}
      onBlur={() => updateSwimmer({ ...swimmer, name: value })}
    ></TextInput>
  );
}
