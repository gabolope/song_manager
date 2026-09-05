import { createBrowserRouter, Outlet } from "react-router-dom";
import DirectorPage from "./components/DirectorPage";
import ErrorPage from "./components/ErrorPage";
import HomePage from "./components/HomePage";
import Layout from "./components/Layout";
import PlayerPage from "./components/PlayerPage";
import SessionProvider from "./contexts/SessionProvider";

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
            path: "director",
            element: <DirectorPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "player",
            element: <PlayerPage />,
            errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
