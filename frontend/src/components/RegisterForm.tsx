import { FormEvent, useState } from "react";
import { Box, Button, Callout, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { registerUser } from "../api/register";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await registerUser({ name, username, password });
      setSuccess(data.message || "Cadastro realizado.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card size="4" className="register-card">
      <Heading as="h2" size="6" mb="2">
        Cadastro livre
      </Heading>
      <Text as="p" size="4" color="gray" mb="5">
        Cria o usuário no realm <strong>demo</strong> com MFA obrigatório: no primeiro login o Keycloak pede
        configurar OTP (Google Authenticator, etc.). Depois, cada login exige o código de 6 dígitos.
      </Text>

      {error ? (
        <Callout.Root color="red" size="3" mb="4">
          <Callout.Text size="4">{error}</Callout.Text>
        </Callout.Root>
      ) : null}

      {success ? (
        <Callout.Root color="green" size="3" mb="4">
          <Callout.Text size="4">{success}</Callout.Text>
        </Callout.Root>
      ) : null}

      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="label" size="4" weight="medium" htmlFor="reg-name">
              Nome
            </Text>
            <TextField.Root
              id="reg-name"
              size="3"
              mt="2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Demo"
              required
              autoComplete="name"
            />
          </Box>
          <Box>
            <Text as="label" size="4" weight="medium" htmlFor="reg-user">
              Usuário
            </Text>
            <TextField.Root
              id="reg-user"
              size="3"
              mt="2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="maria"
              required
              autoComplete="username"
            />
          </Box>
          <Box>
            <Text as="label" size="4" weight="medium" htmlFor="reg-pass">
              Senha
            </Text>
            <TextField.Root
              id="reg-pass"
              size="3"
              mt="2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Box>
          <Flex justify="end" mt="2">
            <Button size="4" type="submit" loading={busy}>
              Cadastrar
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}
