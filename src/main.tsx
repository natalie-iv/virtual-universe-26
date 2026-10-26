import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@primer/react-brand/fonts/fonts.css";
import "@primer/react-brand/lib/css/main.css";
import "./styles.css";
import UniverseWorkshop from "./prototype/Custom";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <UniverseWorkshop />
  </StrictMode>,
);
