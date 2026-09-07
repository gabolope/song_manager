import { onAuthStateChanged, type User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { fetchUserProfile, login, logout as logoutRequest } from "../services/auth.service";
import type { UserProfile } from "../types/user";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Arranca en true: hasta que Firebase confirme el estado inicial de sesión
  // no sabemos si hay que mostrar el login o la app.
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Se resetea a loading en cada transición (no solo la inicial): si no,
      // tras un logout "loading" queda en false para siempre y el próximo
      // login navega con el perfil viejo (todavía no llegó el nuevo).
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const enterDemo = useCallback(() => setIsDemo(true), []);

  const logout = useCallback(async () => {
    setIsDemo(false);
    // El modo demo no tiene sesión real de Firebase: no hay nada que cerrar.
    if (auth.currentUser) await logoutRequest();
  }, []);

  return {
    user,
    profile,
    loading,
    isDemo,
    // En demo se muestran las mismas capacidades de director, sin que
    // exista una cuenta real detrás.
    isAdmin: isDemo || profile?.role === "admin",
    enterDemo,
    login,
    logout,
  };
}
