import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Table,
  Text,
  TextField,
  Tooltip
} from "@radix-ui/themes";
import { CheckIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { login } from "../auth";
import { DemoPlaybook } from "./DemoPlaybook";
import { PresentationFlow } from "./PresentationFlow";
import { RegisterForm } from "./RegisterForm";

const demoUsers = [
  { username: "alice", password: "alice123", roles: ["user"] },
  { username: "bob", password: "bob123", roles: ["user", "admin"] }
];

export function LoginScreen({ error }: { error?: string }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function onEnter() {
    setBusy(true);
    try {
      await login();
    } catch {
      setBusy(false);
    }
  }

  async function copyPassword(password: string) {
    await navigator.clipboard.writeText(password);
    setCopied(password);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <Box className="page-shell-login">
      <Text size="4" color="gray" weight="medium" className="eyebrow">
        Realm demo · Authorization Code + PKCE
      </Text>
      <Heading as="h1" className="wordmark" mt="4">
        Keycloak
      </Heading>
      <Text as="p" size="5" color="gray" mt="5" className="lead">
        O browser autentica no Keycloak. O Java não faz login — só valida o JWT e lê as roles.
      </Text>

      <Box mt="5">
        <PresentationFlow activeStep={1} />
      </Box>

      {error ? (
        <Callout.Root color="red" size="3" mt="6">
          <Callout.Text size="4">{error}</Callout.Text>
        </Callout.Root>
      ) : null}

      <Grid columns={{ initial: "1", lg: "2" }} gap="6" mt="7" align="start">
      <Card size="4">
        <Heading as="h2" size="6" mb="2">
          Acesso
        </Heading>
        <Text as="p" size="4" color="gray" mb="5">
          Use uma das contas abaixo na tela do Keycloak. Clique na senha para copiar.
        </Text>

        <Flex direction={{ initial: "column", sm: "row" }} gap="4" mb="5">
          <Box flexGrow="1">
            <Text as="label" size="4" weight="medium" htmlFor="realm">
              Realm
            </Text>
            <TextField.Root id="realm" size="3" value="demo" readOnly mt="2" />
          </Box>
          <Box flexGrow="1">
            <Text as="label" size="4" weight="medium" htmlFor="client">
              Client
            </Text>
            <TextField.Root id="client" size="3" value="frontend" readOnly mt="2" />
          </Box>
        </Flex>

        <Table.Root variant="surface" size="3" className="table-present">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Usuário</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Senha</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Roles</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {demoUsers.map((user) => (
              <Table.Row key={user.username}>
                <Table.Cell>
                  <Text size="4" weight="medium">
                    {user.username}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="3">
                    <Text size="4" style={{ fontFamily: "var(--code-font-family)" }}>
                      {user.password}
                    </Text>
                    <Tooltip content={copied === user.password ? "Copiada" : "Copiar senha"}>
                      <IconButton
                        size="3"
                        variant="ghost"
                        aria-label={`Copiar senha de ${user.username}`}
                        onClick={() => copyPassword(user.password)}
                      >
                        {copied === user.password ? <CheckIcon /> : <ClipboardCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2" wrap="wrap">
                    {user.roles.map((role) => (
                      <Badge key={role} size="2" color={role === "admin" ? "bronze" : "gray"} variant="soft">
                        {role}
                      </Badge>
                    ))}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <Flex mt="6" justify="end">
          <Button size="4" onClick={onEnter} loading={busy}>
            Entrar com Keycloak
          </Button>
        </Flex>
      </Card>

      <RegisterForm />
      </Grid>

      <DemoPlaybook />
    </Box>
  );
}
