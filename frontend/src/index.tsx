// import 'react-devtools';
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChainId, Config, DAppProvider } from "@usedapp/core";

const config: Config = {
    multicallAddresses: {
        [ChainId.Localhost]: '0x41b5442AC9f39C184FED5cABdca00755eB74f682',
        [ChainId.Mumbai]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
        [ChainId.Polygon]: '0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507'
    },
    supportedChains: [ChainId.Mumbai, ChainId.Localhost, ChainId.Polygon],
    notifications: {
        checkInterval: 500,
        expirationPeriod: 5000,
    },
    localStorage: {
        transactionPath: 'transactions',
    },
}

ReactDOM.render(
    <React.StrictMode>
        <DAppProvider config={config}>
            <App/>
        </DAppProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
