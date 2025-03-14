import { Checkbox, Group, Input } from "@mantine/core";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { IMaskInput } from "react-imask";
import { zeitenMask } from "../../utils/input-mask.ts";
import { isEqual } from "lodash-es";

export default function LapTimeCell({ swimmer, disciplineId }: { swimmer: Swimmer; disciplineId: number }) {
  const [updateLapTime, removeLapTime] = useCombinedStore(
    useShallow((state) => [state.updateLapTime, state.removeLapTime]),
  );

  const lapTime = swimmer.lapTimes.get(disciplineId);
  return (
    <Group wrap="nowrap" justify="flex-start">
      <Input
        style={{ width: "4rem" }}
        variant="unstyled"
        component={IMaskInput}
        mask={zeitenMask()}
        value={lapTime?.seconds}
        onAccept={(value: string) => {
          if (value === "" || value === "__:__,__") {
            removeLapTime(swimmer, disciplineId);
          } else {
            // remove 100s of unnecessary local storage writes on page load
            if (!isEqual(lapTime?.seconds, value)) {
              updateLapTime(swimmer, disciplineId, { enabled: lapTime?.enabled ?? true, seconds: value });
            }
          }
        }}
      ></Input>
      <Checkbox
        color="dimmed"
        disabled={lapTime === undefined}
        onChange={(evt) => {
          const value = evt.currentTarget.checked;
          if (!isEqual(lapTime?.enabled, value)) {
            // remove 100s of unnecessary local storage writes on page load
            updateLapTime(swimmer, disciplineId, {
              seconds: lapTime?.seconds ?? "",
              enabled: value,
            });
          }
        }}
        checked={lapTime?.enabled ?? true}
      />
    </Group>
  );
}
