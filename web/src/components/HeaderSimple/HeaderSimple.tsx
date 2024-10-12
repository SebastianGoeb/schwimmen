import { Burger, Button, Container, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { link: "schwimmer", label: "Schwimmer", disabled: false },
  { link: "zeiten", label: "Zeiten", disabled: false },
  { link: "staffeln", label: "Staffeln", disabled: true },
  { link: "optimieren", label: "Optimieren", disabled: true },
  { link: "importieren", label: "Importieren", disabled: true },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
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
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
