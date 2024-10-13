import { notifications } from "@mantine/notifications";

export function showProgrammingErrorNotification() {
  notifications.show({
    title: "Oh nein",
    message:
      "Das ging gerade nicht, weil irgendetwas falsch programmiert wurde. Bitte kontaktieren sie den Entwickler unter https://github.com/SebastianGoeb/schwimmen/issues",
    color: "red",
    position: "top-right",
    withBorder: true,
  });
}
