import { useSessionState } from "../hooks/useSessionState";
import SessionContext from "./SessionContext";

interface Props {
  children: React.ReactNode;
}

const SessionProvider = ({ children }: Props) => {
  const session = useSessionState();

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
