import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./App";
import { IntakeProvider } from "./state/IntakeContext";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing root element.");

const appTheme = {
  ...webLightTheme,
  fontFamilyBase: "Arial, Helvetica, sans-serif",
  fontFamilyNumeric: "Arial, Helvetica, sans-serif",
  fontFamilyMonospace: "Consolas, 'Courier New', monospace",
  fontSizeBase300: "16px",
  fontSizeBase400: "18px",
  fontSizeBase500: "20px",
  lineHeightBase300: "24px",
  lineHeightBase400: "26px",
  lineHeightBase500: "28px",
} as any;

createRoot(rootEl).render(
  <StrictMode>
    <FluentProvider theme={appTheme}>
      <IntakeProvider>
        <App />
      </IntakeProvider>
    </FluentProvider>
  </StrictMode>
);
