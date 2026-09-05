import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        textAlign: "center",
        padding: "1.5rem",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Oops...</h1>
      <p style={{ color: "var(--text-muted)", margin: 0 }}>
        {isRouteErrorResponse(error)
          ? "Página no encontrada."
          : "Ocurrió un error inesperado."}
      </p>
      <Link
        to="/"
        style={{
          marginTop: "0.5rem",
          color: "var(--accent)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default ErrorPage;
