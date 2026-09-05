import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <>
      <h1>Oops...</h1>
      <p>{isRouteErrorResponse(error) ? "InvalidPage" : "Unexpected Error"}</p>
      <Link to="/">Volver al inicio</Link>
    </>
  );
};

export default ErrorPage;
