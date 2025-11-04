import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

import { GlobalWorkerOptions } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Lector / PDF.js worker configuration (per docs)
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Application error:", error, errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
