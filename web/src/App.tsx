import "./App.css";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import { HeaderSimple } from "./components/HeaderSimple/HeaderSimple.tsx";
import { Outlet } from "react-router-dom";
import { Space } from "@mantine/core";

export default function App() {
  return (
    <main>
      <HeaderSimple />
      <Outlet />
      <Space h="xl" />
    </main>
  );
}
