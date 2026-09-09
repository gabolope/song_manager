import { createBrowserRouter, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionProvider from "./contexts/SessionProvider";
import DirectorPage from "./pages/DirectorPage/DirectorPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import HomePage from "./pages/HomePage/HomePage";
import PlayerPage from "./pages/PlayerPage/PlayerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        // Un único SessionProvider compartido entre Director y Player: así
        // cambiar de vista (ej. desde Configuration) no reinicia la selección
        // ni la navegación en curso.
        element: (
          <SessionProvider>
            <Outlet />
          </SessionProvider>
        ),
        children: [
          {
            element: <ProtectedRoute requireAdmin />,
            errorElement: <ErrorPage />,
            children: [{ path: "director", element: <DirectorPage /> }],
          },
          {
            element: <ProtectedRoute />,
            errorElement: <ErrorPage />,
            children: [{ path: "player", element: <PlayerPage /> }],
          },
        ],
      },
    ],
  },
]);

export default router;
