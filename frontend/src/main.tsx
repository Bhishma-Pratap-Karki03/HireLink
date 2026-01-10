import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable disruptive browser dialogs across the app
if (typeof window !== "undefined") {
  // No-op alert
  window.alert = () => {};
  // Default deny confirm (acts like pressing Cancel)
  window.confirm = () => false;
  // Default empty prompt (acts like pressing Cancel)
  window.prompt = () => null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
