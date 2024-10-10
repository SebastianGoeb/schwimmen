import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Importieren from "./pages/Importieren/Importieren.tsx";
import Staffeln from "./pages/Staffeln/Staffeln.tsx";
import Optimieren from "./pages/Optimieren/Optimieren.tsx";
import Schwimmer from "./pages/Schwimmer/Schwimmer.tsx";
import Zeiten from "./pages/Zeiten/Zeiten.tsx";

const theme = createTheme({
  cursorType: "pointer",
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "schwimmer", element: <Schwimmer /> },
      { path: "zeiten", element: <Zeiten /> },
      { path: "staffeln", element: <Staffeln /> },
      { path: "optimieren", element: <Optimieren /> },
      { path: "importieren", element: <Importieren /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <RouterProvider router={router}></RouterProvider>
    </MantineProvider>
  </StrictMode>,
);
