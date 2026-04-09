import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./App";
import { IntakeProvider } from "./state/IntakeContext";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing root element.");

createRoot(rootEl).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme}>
      <IntakeProvider>
        <App />
      </IntakeProvider>
    </FluentProvider>
  </StrictMode>
);
