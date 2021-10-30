// import 'react-devtools';
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DAppProvider, Config, ChainId } from "@usedapp/core";

const config: Config = {
    multicallAddresses: {
        [ChainId.Localhost]: '0x41b5442AC9f39C184FED5cABdca00755eB74f682'
    },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);