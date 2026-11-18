import { NextUIProvider } from "@nextui-org/react";
import { ToastContainer } from "./components/ToastContainer";
import App from "./App";
import { useTheme } from "./theme/useTheme";

export function AppFrame() {
  const { mode } = useTheme();
  return (
    <NextUIProvider>
      <main className={`${mode} text-foreground bg-background min-h-screen relative`}>
        <App />
        <ToastContainer />
      </main>
    </NextUIProvider>
  );
}
