import { createBrowserRouter } from "react-router-dom";
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
        path: "director",
        element: (
          <SessionProvider>
            <DirectorPage />
          </SessionProvider>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "player",
        element: (
          <SessionProvider>
            <PlayerPage />
          </SessionProvider>
        ),
        errorElement: <ErrorPage />,
      },
    ],
  },
]);

export default router;
