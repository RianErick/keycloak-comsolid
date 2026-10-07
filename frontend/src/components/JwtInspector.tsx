import { useMemo, useState } from "react";
import { Badge, Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { CheckIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { decodeJwtHeader, decodeJwtPayload, splitJwt } from "../lib/jwt";
import { formatExpiry, prettyJson } from "../lib/format";
import { realmRoles } from "../auth";

function ColoredToken({ token }: { token: string }) {
  const { header, payload, signature } = splitJwt(token);

  return (
    <pre className="jwt-encoded" aria-label="JWT codificado">
      <span className="jwt-seg jwt-seg-header">{header}</span>
      <span className="jwt-seg jwt-seg-dot">.</span>
      <span className="jwt-seg jwt-seg-payload">{payload}</span>
      <span className="jwt-seg jwt-seg-dot">.</span>
      <span className="jwt-seg jwt-seg-signature">{signature}</span>
    </pre>
  );
}

function DecodedPanel({
  title,
  subtitle,
  json
}: {
  title: string;
  subtitle: string;
  json: string;
}) {
  const lines = json.split("\n");

  return (
    <Box className="jwt-decoded-block">
      <Flex align="baseline" justify="between" gap="3" mb="2" wrap="wrap">
        <Heading as="h3" size="4" className="jwt-decoded-title">
          {title}
        </Heading>
        <Text size="3" color="gray" weight="medium">
          {subtitle}
        </Text>
      </Flex>
      <pre className="jwt-decoded-json">
        {lines.map((line, index) => (
          <span key={index} className={lineIsHighlighted(line) ? "jwt-json-line jwt-json-line--hi" : "jwt-json-line"}>
            {line}
            {"\n"}
          </span>
        ))}
      </pre>
    </Box>
  );
}

function lineIsHighlighted(line: string) {
  const keys = ["realm_access", "preferred_username", "roles", "exp", "iss", "email"];
  return keys.some((key) => line.includes(`"${key}"`));
}

export function JwtInspector({ token }: { token: string }) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const header = useMemo(() => decodeJwtHeader(token), [token]);
  const payload = useMemo(() => decodeJwtPayload(token), [token]);
  const roles = realmRoles(payload);
  const headerJson = useMemo(() => prettyJson(header), [header]);
  const payloadJson = useMemo(() => prettyJson(payload), [payload]);

  async function copyToken() {
    await navigator.clipboard.writeText(token);
    setCopiedToken(true);
    window.setTimeout(() => setCopiedToken(false), 1200);
  }

  async function copyPayload() {
    await navigator.clipboard.writeText(payloadJson);
    setCopiedPayload(true);
    window.setTimeout(() => setCopiedPayload(false), 1200);
  }

  return (
    <Box className="jwt-inspector">
      <Flex align="center" justify="between" gap="4" mb="4" wrap="wrap">
        <Box>
          <Text size="3" className="eyebrow" color="gray">
            Estilo jwt.io · access token
          </Text>
          <Flex align="center" gap="3" mt="2" wrap="wrap">
            <Badge size="2" color="bronze" variant="soft">
              {payload.preferred_username || "usuário"}
            </Badge>
            {roles.map((role) => (
              <Badge key={role} size="2" color={role === "admin" ? "bronze" : "gray"} variant="soft">
                {role}
              </Badge>
            ))}
            {payload.exp ? (
              <Text size="3" color="gray">
                expira {formatExpiry(payload.exp)}
              </Text>
            ) : null}
          </Flex>
        </Box>
        <Flex gap="3" wrap="wrap">
          <Button size="3" variant="soft" onClick={copyToken}>
            {copiedToken ? <CheckIcon /> : <ClipboardCopyIcon />}
            {copiedToken ? "Copiado" : "Copiar token"}
          </Button>
          <Button size="3" variant="soft" onClick={copyPayload}>
            {copiedPayload ? <CheckIcon /> : <ClipboardCopyIcon />}
            {copiedPayload ? "Copiado" : "Copiar payload"}
          </Button>
        </Flex>
      </Flex>

      <div className="jwt-split">
        <section className="jwt-pane jwt-pane-encoded">
          <Heading as="h3" size="4" mb="2">
            Encoded
          </Heading>
          <Text size="3" color="gray" mb="3">
            Três partes em Base64URL: header · payload · signature
          </Text>
          <ColoredToken token={token} />
          <Text size="3" color="gray" mt="3" className="jwt-legend">
            <span className="jwt-legend-item jwt-legend-header">Header</span>
            <span className="jwt-legend-item jwt-legend-payload">Payload</span>
            <span className="jwt-legend-item jwt-legend-signature">Signature</span>
          </Text>
        </section>

        <section className="jwt-pane jwt-pane-decoded">
          <Heading as="h3" size="4" mb="2">
            Decoded
          </Heading>
          <Text size="3" color="gray" mb="3">
            O backend Java valida a assinatura com as chaves JWKS do realm e lê o payload.
          </Text>
          <Flex direction="column" gap="4" className="jwt-decoded-stack">
            <DecodedPanel title="HEADER" subtitle="ALGORITHM & TOKEN TYPE" json={headerJson} />
            <DecodedPanel title="PAYLOAD" subtitle="DATA · claims do Keycloak" json={payloadJson} />
            <Box className="jwt-signature-note">
              <Text size="3" weight="medium">
                SIGNATURE
              </Text>
              <Text size="3" color="gray" mt="1">
                Terceira parte do token (não decodificada aqui). O Spring confere a assinatura contra{" "}
                <code>/protocol/openid-connect/certs</code> — não confia só no JSON.
              </Text>
            </Box>
          </Flex>
        </section>
      </div>
    </Box>
  );
}
