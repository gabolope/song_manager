import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useColorMode } from "./color-mode";

export function AppToastContainer() {
  const { colorMode } = useColorMode();
  return (
    <ToastContainer
      position="bottom-right"
      theme={colorMode}
      pauseOnFocusLoss={false}
      autoClose={3000}
    />
  );
}
