import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { IntakeProvider } from "./state/IntakeContext.jsx";

const rootEl = document.getElementById("root");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <IntakeProvider>
        <App />
      </IntakeProvider>
    </FluentProvider>
  </React.StrictMode>
);