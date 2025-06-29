import "@mantine/notifications/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@mantine/charts/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, replace, RouterProvider } from "react-router-dom";
import Relays from "./pages/Relays/Relays.tsx";
import Berechnen from "./pages/Berechnen/Berechnen.tsx";
import Swimmers from "./pages/Swimmers/Swimmers.tsx";
import LapTimes from "./pages/LapTimes/LapTimes.tsx";
import { Notifications } from "@mantine/notifications";
import Developer from "./pages/Developer/Developer.tsx";
import LogRocket from "logrocket";

LogRocket.init("pc9l0b/schwimmen", {
  release: __APP_VERSION__,
});

const theme = createTheme({
  cursorType: "pointer",
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, loader: async () => replace("/schwimmer") },
      { path: "schwimmer", element: <Swimmers /> },
      { path: "zeiten", element: <LapTimes /> },
      { path: "staffeln", element: <Relays /> },
      { path: "berechnen", element: <Berechnen /> },
      { path: "dev", element: <Developer /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      <RouterProvider router={router}></RouterProvider>
    </MantineProvider>
  </StrictMode>,
);
