import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Code,
  DataList,
  Flex,
  Grid,
  Heading,
  Separator,
  Text
} from "@radix-ui/themes";
import { ExitIcon, ReaderIcon } from "@radix-ui/react-icons";
import { callApi, decodeJwt, logout, realmRoles } from "../auth";
import { splitJwt } from "../lib/jwt";
import { apiHint, formatExpiry, remainingLabel } from "../lib/format";
import type { ApiCallResult, AppProfile, TokenSet } from "../types";
import { ClaimsDialog } from "./ClaimsDialog";
import { DemoPlaybook } from "./DemoPlaybook";
import { PresentationFlow } from "./PresentationFlow";

const endpoints = [
  { value: "/public", label: "/api/public", auth: false },
  { value: "/me", label: "/api/me", auth: true },
  { value: "/admin", label: "/api/admin", auth: true }
] as const;

function TokenPreview({ token }: { token: string }) {
  const { header, payload, signature } = splitJwt(token);
  return (
    <pre className="jwt-encoded jwt-encoded-compact" aria-hidden="true">
      <span className="jwt-seg jwt-seg-header">{header.slice(0, 24)}…</span>
      <span className="jwt-seg jwt-seg-dot">.</span>
      <span className="jwt-seg jwt-seg-payload">{payload.slice(0, 32)}…</span>
      <span className="jwt-seg jwt-seg-dot">.</span>
      <span className="jwt-seg jwt-seg-signature">{signature.slice(0, 20)}…</span>
    </pre>
  );
}

export function Console({
  tokens,
  onTokensChange
}: {
  tokens: TokenSet;
  onTokensChange: (tokens: TokenSet) => void;
}) {
  const claims = useMemo(() => decodeJwt(tokens.access_token), [tokens.access_token]);
  const roles = realmRoles(claims);
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [path, setPath] = useState<(typeof endpoints)[number]["value"]>("/me");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApiCallResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [appProfile, setAppProfile] = useState<AppProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await callApi("/me", true);
        if (cancelled) {
          return;
        }
        const body = response.body as { appProfile?: AppProfile | null };
        const profile = body.appProfile;
        const hasProfile = Boolean(profile && profile.keycloakUserId);
        setAppProfile(hasProfile ? profile! : null);
        setProfileError(hasProfile ? null : "Sem registro local para este subject (sub) do JWT.");
        if (response.tokens) {
          onTokensChange(response.tokens);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(error instanceof Error ? error.message : "Falha ao carregar perfil local");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokens.access_token]);

  const username = claims.preferred_username ?? "usuário";
  const selected = endpoints.find((item) => item.value === path)!;
  const remaining = remainingLabel(claims.exp, now);
  const expired = remaining === "expirado";
  const flowStep: 1 | 2 | 3 = result ? 3 : 2;

  async function runCall(endpoint: (typeof endpoints)[number]) {
    setPath(endpoint.value);
    setPending(true);
    setApiError(null);
    try {
      const response = await callApi(endpoint.value, endpoint.auth);
      setResult(response);
      if (response.tokens) {
        onTokensChange(response.tokens);
      }
    } catch (error) {
      setResult(null);
      setApiError(error instanceof Error ? error.message : "Falha ao chamar a API");
    } finally {
      setPending(false);
    }
  }

  return (
    <Box className="page-shell">
      <ClaimsDialog open={claimsOpen} onOpenChange={setClaimsOpen} token={tokens.access_token} />

      <Flex align="start" justify="between" gap="5" wrap="wrap">
        <Box flexGrow="1">
          <Text size="4" color="gray" weight="medium" className="eyebrow">
            Realm demo · sessão ativa
          </Text>
          <Heading as="h1" className="wordmark wordmark-compact" mt="3">
            Keycloak
          </Heading>
          <Box mt="5">
            <PresentationFlow activeStep={flowStep} />
          </Box>
        </Box>
        <Flex align="center" gap="4" wrap="wrap">
          <Badge size="3" color="bronze" variant="soft">
            {username}
          </Badge>
          <Button size="3" variant="soft" onClick={() => setClaimsOpen(true)}>
            <ReaderIcon width="20" height="20" />
            Inspetor JWT
          </Button>
          <Button size="3" variant="outline" color="gray" onClick={logout}>
            <ExitIcon width="20" height="20" />
            Sair
          </Button>
        </Flex>
      </Flex>

      <Grid columns={{ initial: "1", lg: "2" }} gap="6" mt="7">
        <Card size="4">
          <Heading as="h2" size="6" mb="5">
            Titular
          </Heading>
          <DataList.Root size="2" className="data-present">
            <DataList.Item>
              <DataList.Label minWidth="120px">Nome</DataList.Label>
              <DataList.Value>{claims.name || "—"}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="120px">E-mail</DataList.Label>
              <DataList.Value>{claims.email || "—"}</DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
              <DataList.Label minWidth="120px">Roles</DataList.Label>
              <DataList.Value>
                <Flex gap="2" wrap="wrap">
                  {roles.length
                    ? roles.map((role) => (
                        <Badge key={role} size="2" color={role === "admin" ? "bronze" : "gray"} variant="soft">
                          {role}
                        </Badge>
                      ))
                    : "—"}
                </Flex>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="120px">Expira</DataList.Label>
              <DataList.Value>
                <Flex direction="column" gap="2">
                  <Text size="4">{formatExpiry(claims.exp)}</Text>
                  {remaining ? (
                    <Badge size="2" color={expired ? "red" : "bronze"} variant="soft">
                      {expired ? "Token expirado" : `resta ${remaining}`}
                    </Badge>
                  ) : null}
                </Flex>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Card>

        <Card size="4">
          <Heading as="h2" size="6" mb="2">
            Access token
          </Heading>
          <Text size="3" color="gray" mb="4">
            Visualização rápida — abra o inspetor para ver header e payload decodificados (estilo jwt.io).
          </Text>
          <TokenPreview token={tokens.access_token} />
          <Button size="4" mt="4" onClick={() => setClaimsOpen(true)}>
            <ReaderIcon width="22" height="22" />
            Abrir inspetor JWT
          </Button>
        </Card>
      </Grid>

      <Card size="4" mt="6">
        <Heading as="h2" size="6" mb="2">
          Perfil local (PostgreSQL)
        </Heading>
        <Text as="p" size="4" color="gray" mb="4">
          Dados que existem só no backend. O vínculo com o Keycloak é o{" "}
          <Code size="3">keycloakUserId</Code> (mesmo UUID do claim <Code size="3">sub</Code> do JWT).
        </Text>
        {appProfile ? (
          <DataList.Root size="2" className="data-present">
            <DataList.Item>
              <DataList.Label minWidth="160px">Keycloak UUID</DataList.Label>
              <DataList.Value>
                <Code size="3">{appProfile.keycloakUserId}</Code>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="160px">Matrícula</DataList.Label>
              <DataList.Value>{appProfile.employeeCode}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="160px">Departamento</DataList.Label>
              <DataList.Value>{appProfile.department}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="160px">Tier interno</DataList.Label>
              <DataList.Value>{appProfile.customerTier}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="160px">Nota interna</DataList.Label>
              <DataList.Value>{appProfile.internalNote}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        ) : (
          <Callout.Root color="gray" size="3">
            <Callout.Text size="4">{profileError || "Carregando perfil local…"}</Callout.Text>
          </Callout.Root>
        )}
      </Card>

      <Card size="4" mt="6">
        <Heading as="h2" size="6" mb="2">
          Resource server
        </Heading>
        <Text as="p" size="4" color="gray" mb="3">
          GET no backend Java. <Code size="3">/me</Code> e <Code size="3">/admin</Code> enviam o Bearer.
          {selected.auth ? " Este endpoint exige token." : " Este endpoint é público."}
        </Text>
        {selected.auth ? (
          <Text as="p" size="3" color="gray" mb="5">
            Dica: no DevTools você pode ver <strong>OPTIONS</strong> antes do <strong>GET</strong> — preflight CORS
            (frontend :3000 → API :8081).
          </Text>
        ) : (
          <Box mb="5" />
        )}

        <Flex gap="3" wrap="wrap" className="api-request-buttons">
          {endpoints.map((item) => {
            const isLast = result?.path === item.value;
            return (
              <Button
                key={item.value}
                size="3"
                variant={isLast ? "solid" : "outline"}
                disabled={pending}
                onClick={() => runCall(item)}
              >
                GET {item.label}
              </Button>
            );
          })}
        </Flex>
        {pending ? (
          <Text size="3" color="gray" mt="4">
            Chamando {endpoints.find((e) => e.value === path)?.label}…
          </Text>
        ) : null}

        {apiError ? (
          <Callout.Root color="red" size="3" mt="5">
            <Callout.Text size="4">{apiError}</Callout.Text>
          </Callout.Root>
        ) : null}

        {result ? (
          <>
            <Separator size="4" my="5" />
            <Flex align="center" gap="4" mb="3" wrap="wrap">
              <Badge size="2" color={result.status < 400 ? "green" : "red"} variant="soft">
                HTTP {result.status}
              </Badge>
              <Text size="4" color="gray">
                GET {result.path} · {result.elapsed} ms · {result.withAuth ? "com token" : "sem token"}
              </Text>
            </Flex>
            {apiHint(result.status, result.path) ? (
              <Text as="p" size="4" color="gray" mb="4">
                {apiHint(result.status, result.path)}
              </Text>
            ) : null}
            <Code className="code-panel code-panel-lg" variant="soft" style={{ display: "block" }}>
              {JSON.stringify(result.body, null, 2)}
            </Code>
          </>
        ) : !apiError ? (
          <Text as="p" size="4" color="gray" mt="5">
            Escolha um endpoint e chame a API.
          </Text>
        ) : null}
      </Card>

      <DemoPlaybook />
    </Box>
  );
}
