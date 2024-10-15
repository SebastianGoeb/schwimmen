import { Checkbox, Container, Fieldset, Input, NumberInput, Paper, SimpleGrid, Stack } from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { IMaskInput } from "react-imask";
import { zeitenMask } from "../../utils/input-mask.ts";

function onlyNumbers(value: string | number): number {
  return typeof value === "number" ? value : 0;
}

export default function Berechnen() {
  const [teamSettings, updateTeamSettings] = useStore(
    useShallow((state) => [state.teamSettings, state.updateTeamSettings]),
  );

  return (
    <Container size="xl">
      <h1>Berechnen</h1>

      <SimpleGrid cols={1}>
        <Paper withBorder shadow="md" p="xl">
          <h2>Einstellungen</h2>
          <SimpleGrid cols={2}>
            <Fieldset legend="Min">
              <Stack>
                <NumberInput
                  label="Min Schwimmer"
                  min={0}
                  value={teamSettings.minSchwimmerProTeam}
                  onChange={(value) => updateTeamSettings({ minSchwimmerProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Starts pro Schwimmer"
                  min={0}
                  value={teamSettings.minStartsProSchwimmer}
                  onChange={(value) => updateTeamSettings({ minStartsProSchwimmer: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Jungen"
                  min={0}
                  value={teamSettings.minMaleProTeam}
                  onChange={(value) => updateTeamSettings({ minMaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Mädchen"
                  min={0}
                  value={teamSettings.minFemaleProTeam}
                  onChange={(value) => updateTeamSettings({ minFemaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
              </Stack>
            </Fieldset>
            <Fieldset legend="Max">
              <Stack>
                <NumberInput
                  label="Max Schwimmer"
                  min={0}
                  value={teamSettings.maxSchwimmerProTeam}
                  onChange={(value) => updateTeamSettings({ maxSchwimmerProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Max Starts pro Schwimmer"
                  min={0}
                  value={teamSettings.maxStartsProSchwimmer}
                  onChange={(value) => updateTeamSettings({ maxStartsProSchwimmer: onlyNumbers(value) })}
                ></NumberInput>
              </Stack>
            </Fieldset>
            <Fieldset legend="Teamerstellung" style={{ flexGrow: 1 }}>
              <Stack>
                <NumberInput
                  label="Anzahl Teams"
                  min={1}
                  value={teamSettings.anzahlTeams}
                  onChange={(value) => updateTeamSettings({ anzahlTeams: onlyNumbers(value) })}
                ></NumberInput>
                {teamSettings.anzahlTeams > 1 && (
                  <Input.Wrapper
                    label="Max Erlaubte Differenz der Staffelzeiten zweier Teams"
                    description="Eine geringe Zeitspanne kann eine schlechtere Gesamtzeit bewirken, oder sogar dass keine valide Teamzusammenstellung generiert werden kann. Zeitspanne wird je Staffel berechnet."
                  >
                    <Input
                      component={IMaskInput}
                      mask={zeitenMask()}
                      value={teamSettings.maxZeitspanneProStaffelSeconds}
                      onAccept={(value: string) => {
                        updateTeamSettings({ maxZeitspanneProStaffelSeconds: value });
                      }}
                    ></Input>
                  </Input.Wrapper>
                )}
              </Stack>
            </Fieldset>
            <Fieldset legend="Weitere" style={{ flexGrow: 1 }}>
              <Checkbox
                label="Alle müssen schwimmen"
                description="Alle anwesenden Teilnehmer müssen mindestens ein mal schwimmen. Bewirkt üblicherweise ein schlechtere Gesamtzeit."
                checked={teamSettings.alleMuessenSchwimmen}
                onChange={(evt) => {
                  updateTeamSettings({ alleMuessenSchwimmen: evt.currentTarget.checked });
                }}
              ></Checkbox>
            </Fieldset>
          </SimpleGrid>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
