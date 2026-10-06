import type { User } from "firebase/auth";
import React, { useContext } from "react";
import type { UserProfile } from "../types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  // Dueño de la app: entra a /admin (alta de equipos, mover miembros).
  // Tiene doc en `superadmins/{uid}`; independiente de role y de teamId.
  isSuperAdmin: boolean;
  // Equipo del usuario (sale de profile.teamId). null en demo y en usuarios
  // sin migrar: en ese caso no se escucha ni escribe nada del equipo.
  teamId: string | null;
  // Modo demo: navegación libre sin cuenta real ni escrituras a Firestore,
  // para que alguien sin credenciales pueda probar la app (ver TODO.md).
  isDemo: boolean;
  // Un admin puede optar por no dirigir: se comporta como músico (va a
  // /player) sin dejar de ser admin. Se guarda por uid en localStorage.
  wantsToDirect: boolean;
  setWantsToDirect: (value: boolean) => void;
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
