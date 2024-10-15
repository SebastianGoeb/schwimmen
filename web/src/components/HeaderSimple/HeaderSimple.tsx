import { Burger, Button, Container, Drawer, Group, Image, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { link: "schwimmer", label: "Schwimmer", disabled: false },
  { link: "zeiten", label: "Zeiten", disabled: false },
  { link: "staffeln", label: "Staffeln", disabled: false },
  { link: "optimieren", label: "Optimieren", disabled: true },
  { link: "importieren", label: "Importieren", disabled: true },
  { link: "dev", label: "Entwicklerbereich", disabled: false },
];

export function HeaderSimple() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items = links.map((link) => {
    const href = `/${link.link}`;
    return (
      <Button
        variant={location.pathname === href || undefined ? "outline" : "subtle"}
        disabled={link.disabled}
        key={link.label}
        onClick={(event) => {
          event.preventDefault();
          close();
          navigate(href);
        }}
      >
        {link.label}
      </Button>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Image src={"/icon128.png"} h={32} />

        {/* desktop design */}
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        {/* mobile design */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
        <Drawer opened={opened} onClose={close} position="right" size="66%" hiddenFrom="xs">
          <Stack>{items}</Stack>
        </Drawer>
      </Container>
    </header>
  );
}
