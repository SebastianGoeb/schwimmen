import { Checkbox, Group, Text } from "@mantine/core";
import { formatZeit } from "../../lib/schwimmen/util/zeit.ts";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { Swimmer } from "../../model/swimmer.ts";

export default function ZeitenCell({ swimmer, disciplineId }: { swimmer: Swimmer; disciplineId: number }) {
  const [updateLapTimeEnabled] = useStore(useShallow((state) => [state.updateLapTimeEnabled]));

  const lapTime = swimmer.lapTimes.get(disciplineId);

  if (lapTime === undefined) {
    return undefined;
  }

  return (
    <Group>
      <Text c={lapTime.enabled ? undefined : "dimmed"}>{formatZeit(lapTime.seconds)}</Text>
      <Checkbox
        color="gray"
        onChange={(evt) => updateLapTimeEnabled(swimmer, disciplineId, evt.currentTarget.checked)}
        checked={lapTime.enabled}
      />
    </Group>
  );
}
