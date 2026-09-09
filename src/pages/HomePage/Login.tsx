import { Button, Field, Input, Separator, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toaster } from "@/components/ui/toaster";
import { useColorModeValue } from "@/components/ui/color-mode";
import "./HomePage.css";

const Login = () => {
  const { login, enterDemo } = useAuth();
  const logoSrc = useColorModeValue("/logo_black.svg", "/logo_white.svg");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch {
      toaster.create({
        type: "error",
        title: "No se pudo iniciar sesión",
        description: "Revisá el email y la contraseña.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => {
    enterDemo();
    navigate("/director", { replace: true });
  };

  return (
    <div className="home-wrap">
      <div className="home-heading">
        <img src={logoSrc} alt="" aria-hidden="true" className="home-logo" />
        <p className="home-title">Song Manager</p>
        <p className="home-subtitle">Ingresá con tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360 }}>
        <Stack gap={4}>
          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Contraseña</Field.Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field.Root>
          <Button type="submit" loading={isSubmitting} w="100%">
            Entrar
          </Button>
        </Stack>
      </form>

      <Stack width="100%" maxWidth="360px" gap={3} align="center">
        <Separator width="100%" />
        <Text fontSize="sm" color="var(--text-muted)" textAlign="center">
          ¿Solo estás mirando?
        </Text>
        <Button variant="outline" w="100%" onClick={handleDemo}>
          Probar aplicación sin credenciales
        </Button>
      </Stack>
    </div>
  );
};

export default Login;
