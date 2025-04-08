import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter } from "react-router-dom";
import {Provider} from "react-redux";
import { rdxStore } from "./redux/rdxStore";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={rdxStore}>
  <HashRouter>
    <App />
  </HashRouter>
  </Provider>
);

reportWebVitals();
