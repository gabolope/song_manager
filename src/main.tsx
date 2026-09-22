import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import router from "./routes.tsx";
import "./index.css";

const queryClient = new QueryClient();

const App = () => {
  // El Provider de tema vive fuera del router, así que la ruta se lee del
  // propio router. Modo lyrics es siempre oscuro, sin importar la preferencia
  // del usuario ni la del sistema.
  const pathname = useSyncExternalStore(
    router.subscribe,
    () => router.state.location.pathname,
  );
  return (
    <Provider forcedTheme={pathname === "/lyrics" ? "dark" : undefined}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Provider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
