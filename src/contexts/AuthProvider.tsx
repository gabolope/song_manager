import { useAuthState } from "../hooks/useAuthState";
import AuthContext from "./AuthContext";

interface Props {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
