import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { Catalog } from "@linesight/kit/catalog";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Catalog />
  </React.StrictMode>,
);
