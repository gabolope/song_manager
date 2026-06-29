import { createBrowserRouter } from "react-router-dom";
import DirectorPage from "./components/DirectorPage";
import ErrorPage from "./components/ErrorPage";
import HomePage from "./components/HomePage";
import Layout from "./components/Layout";
import PlayerPage from "./components/PlayerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "director", element: <DirectorPage /> },
      { path: "player", element: <PlayerPage /> },
    ],
  },
]);

export default router;
