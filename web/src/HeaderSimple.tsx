import { Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import { IconBrandMantine } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { link: "optimieren", label: "Optimieren" },
  { link: "schwimmer", label: "Schwimmer" },
  { link: "staffeln", label: "Staffeln" },
  { link: "importieren", label: "Importieren" },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items = links.map((link) => (
    <a
      key={link.label}
      href={`/tabs/${link.link}`}
      className={classes.link}
      data-active={location.pathname === `/tabs/${link.link}` || undefined}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/tabs/${link.link}`);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <IconBrandMantine size={28} />
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
