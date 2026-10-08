import { Box, Callout, Text } from "@radix-ui/themes";

const beats = [
  "Cadastre um usuário novo (nome, sobrenome, e-mail, usuário e senha) → configure OTP no Keycloak → nos logins seguintes informe o código MFA.",
  "Entre como alice → abra o inspetor JWT e mostre realm_access.roles (só user).",
  "Chame GET /v1/users/me (200) e GET /v1/users/alice (403 — falta role admin).",
  "Saia e entre como bob → GET /v1/users/alice (200).",
  "No DevTools (opcional): /v1/users/me dispara OPTIONS + GET por CORS (porta 3000 → 8081 + header Authorization)."
];

export function DemoPlaybook() {
  return (
    <Callout.Root color="bronze" size="3" mt="6" className="demo-playbook">
      <Box>
        <Callout.Text>
          <Text size="4" weight="medium" as="p" mb="3">
            Roteiro sugerido (5 min)
          </Text>
        </Callout.Text>
        <ul className="demo-playbook-list">
          {beats.map((beat) => (
            <li key={beat}>
              <Text size="3" as="span">
                {beat}
              </Text>
            </li>
          ))}
        </ul>
      </Box>
    </Callout.Root>
  );
}
