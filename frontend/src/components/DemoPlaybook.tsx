import { Box, Callout, Text } from "@radix-ui/themes";

const beats = [
  "Cadastre um usuário novo (Nome, Usuário, Senha) → Entrar → configure OTP no Keycloak → nos logins seguintes informe o código MFA.",
  "Entre como alice → abra o inspetor JWT e mostre realm_access.roles (só user).",
  "Chame GET /api/me (200) e GET /api/admin (403 — falta role admin).",
  "Saia e entre como bob → /api/admin (200).",
  "No DevTools (opcional): /api/me dispara OPTIONS + GET por CORS (porta 3000 → 8081 + header Authorization)."
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
