import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./components/ToastProvider.tsx";
import "./index.css";
import { ThemeProvider } from "./theme/ThemeContext.tsx";
import { AppFrame } from "./AppFrame.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AppFrame />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);
