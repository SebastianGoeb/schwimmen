import { Burger, Container, Group, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSimple.module.css";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { link: "schwimmer", label: "Schwimmer" },
  { link: "zeiten", label: "Zeiten" },
  { link: "staffeln", label: "Staffeln" },
  { link: "optimieren", label: "Optimieren" },
  { link: "importieren", label: "Importieren" },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items = links.map((link) => {
    const href = `/${link.link}`;
    return (
      <a
        key={link.label}
        href={href}
        className={classes.link}
        data-active={location.pathname === href || undefined}
        onClick={(event) => {
          event.preventDefault();
          navigate(href);
        }}
      >
        {link.label}
      </a>
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
