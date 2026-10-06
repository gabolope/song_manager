import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ requireAdmin, requireSuperAdmin }: Props) => {
  const { user, loading, isAdmin, isSuperAdmin, isDemo } = useAuth();

  if (loading) return null;
  if (!user && !isDemo) return <Navigate to="/" replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/player" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
