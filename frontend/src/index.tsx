import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RootStore, storesContext } from "@stores";
import { loadState, saveState } from "@src/utils/localStorage";
import { autorun } from "mobx";
import { HashRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ThemeWrapper from "@src/themes/ThemeProvider";
// import GlobalStyles from "@src/themes/GlobalStyles";
// css
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import "rc-dialog/assets/index.css";
import "./index.css";
import "normalize.css";

const initState = loadState();

const mobxStore = new RootStore(initState);
autorun(
	() => {
		console.dir(mobxStore);
		saveState(mobxStore.serialize());
	},
	{ delay: 1000 },
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	// <React.StrictMode>
	<storesContext.Provider value={mobxStore}>
		<ThemeWrapper>
			<Router>
				<App />
			</Router>
			<ToastContainer
				icon={<div />}
				position="bottom-right"
				autoClose={5000}
				newestOnTop={true}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
			{/*<GlobalStyles />*/}
		</ThemeWrapper>
	</storesContext.Provider>,
	// </React.StrictMode>,
);
