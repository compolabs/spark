import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ThemeWrapper from "@src/themes/ThemeProvider";
import { loadState } from "@src/utils/localStorage";
import { RootStore, storesContext } from "@stores";

import GlobalStyles from "./themes/GlobalStyles";
import App from "./App";

import "react-toastify/dist/ReactToastify.css";
import "rc-dialog/assets/index.css";
import "./index.css";
import "normalize.css";

const initState = loadState();

const STORE = RootStore.create(initState);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <React.StrictMode>
  <storesContext.Provider value={STORE}>
    <ThemeWrapper>
      <Router>
        <App />
      </Router>
      <ToastContainer
        autoClose={5000}
        closeOnClick={false}
        icon={<div />}
        newestOnTop={true}
        position="bottom-right"
        rtl={false}
        theme="dark"
        draggable
        pauseOnFocusLoss
        pauseOnHover
      />
      <GlobalStyles />
    </ThemeWrapper>
  </storesContext.Provider>,
  // </React.StrictMode>,
);
