import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";

const HomePage = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // El rol ya no se elige: lo define la cuenta. Apenas hay sesión, se manda
  // directo a la vista que le corresponde.
  useEffect(() => {
    // No navegar hasta que loading sea false: mientras el perfil todavía se
    // está leyendo de Firestore, isAdmin vale false por default y mandaría
    // a un admin a /player por error.
    if (!loading && user)
      navigate(isAdmin ? "/director" : "/player", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  if (loading || user) return null;

  return <Login />;
};

export default HomePage;
