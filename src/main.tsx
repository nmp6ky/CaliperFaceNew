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
  fontFamilyBase: "'Segoe UI', Tahoma, Arial, sans-serif",
  fontFamilyNumeric: "'Segoe UI', Tahoma, Arial, sans-serif",
  fontFamilyMonospace: "Consolas, 'Courier New', monospace",
  fontSizeBase300: "16px",
  fontSizeBase400: "18px",
  fontSizeBase500: "20px",
  lineHeightBase300: "24px",
  lineHeightBase400: "26px",
  lineHeightBase500: "28px",
  colorBrandBackground: "#111111",
  colorBrandBackgroundHover: "#2b2b2b",
  colorBrandBackgroundPressed: "#000000",
  colorBrandBackground2: "#1f2937",
  colorBrandForeground1: "#111111",
  colorBrandForegroundLink: "#111111",
  colorBrandForegroundLinkHover: "#000000",
  colorBrandForegroundLinkPressed: "#000000",
  borderRadiusSmall: "0px",
  borderRadiusMedium: "0px",
  borderRadiusLarge: "0px",
  borderRadiusXLarge: "0px",
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
