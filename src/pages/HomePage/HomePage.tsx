import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";

const HomePage = () => {
  const { user, loading, isAdmin, wantsToDirect } = useAuth();
  const navigate = useNavigate();

  // El rol ya no se elige: lo define la cuenta. Apenas hay sesión, se manda
  // directo a la vista que le corresponde. Un admin puede optar por no
  // dirigir (ver Configuration), en cuyo caso también va a /player.
  useEffect(() => {
    // No navegar hasta que loading sea false: mientras el perfil todavía se
    // está leyendo de Firestore, isAdmin vale false por default y mandaría
    // a un admin a /player por error.
    if (!loading && user)
      navigate(isAdmin && wantsToDirect ? "/director" : "/player", { replace: true });
  }, [user, loading, isAdmin, wantsToDirect, navigate]);

  if (loading || user) return null;

  return <Login />;
};

export default HomePage;
