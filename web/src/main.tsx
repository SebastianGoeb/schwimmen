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

const theme = createTheme({});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/tabs",
    element: <App />,
    children: [
      {
        path: "optimieren",
        element: <Optimieren />,
      },
      {
        path: "schwimmer",
        element: <Schwimmer />,
      },
      {
        path: "staffeln",
        element: <Staffeln />,
      },
      {
        path: "importieren",
        element: <Importieren />,
      },
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
