import { Checkbox, Group, Input } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";
import { IMask, IMaskInput } from "react-imask";

export default function ZeitenCell({ swimmer, disciplineId }: { swimmer: Swimmer; disciplineId: number }) {
  const [updateLapTime, removeLapTime] = useStore(useShallow((state) => [state.updateLapTime, state.removeLapTime]));

  const lapTime = swimmer.lapTimes.get(disciplineId);

  return (
    <Group wrap="nowrap" justify="flex-start">
      {/*<Text c={lapTime.enabled ? undefined : "dimmed"}>{formatZeit(lapTime.seconds)}</Text>*/}
      <Input
        style={{ width: "3.5rem" }}
        variant="unstyled"
        component={IMaskInput}
        mask="S0:S0,0"
        blocks={{
          S: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 5,
          },
        }}
        placeholderChar="_"
        lazy={false}
        value={lapTime?.seconds}
        onAccept={(value: string) => {
          if (value === "" || value === "__:__,_") {
            removeLapTime(swimmer, disciplineId);
          } else {
            updateLapTime(swimmer, disciplineId, { enabled: lapTime?.enabled ?? true, seconds: value });
          }
        }}
      ></Input>
      <Checkbox
        color="gray"
        disabled={lapTime === undefined}
        onChange={(evt) =>
          updateLapTime(swimmer, disciplineId, { seconds: lapTime?.seconds ?? "", enabled: evt.currentTarget.checked })
        }
        checked={lapTime?.enabled ?? true}
      />
    </Group>
  );
}
