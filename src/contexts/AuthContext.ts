import type { User } from "firebase/auth";
import React, { useContext } from "react";
import type { UserProfile } from "../types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  // Modo demo: navegación libre sin cuenta real ni escrituras a Firestore,
  // para que alguien sin credenciales pueda probar la app (ver TODO.md).
  isDemo: boolean;
  enterDemo: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export default AuthContext;
