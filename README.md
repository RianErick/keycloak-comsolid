# setup-keycloak-consolid

Ambiente local de Keycloak com uma SPA em React e um resource server em Java. O Compose sobe Keycloak, dois Postgres independentes (um para o Keycloak e outro para o backend), Flyway e MailHog; frontend e backend rodam localmente.

O browser autentica no Keycloak (Authorization Code + PKCE), recebe um JWT e chama a API. O Spring Boot não faz login: só valida a assinatura do token e autoriza pela role.

## Como rodar

```bash
cp .env.example .env
docker compose up
```

Na primeira subida o Keycloak importa o realm. Espere o Keycloak ficar pronto (cerca de 1 minuto), depois inicie backend e frontend em terminais separados.

Antes de iniciar o backend pela primeira vez, abra o console do Keycloak, entre no realm `demo`, vá em **Clients → backend-client → Credentials** e copie o client secret para `KEYCLOAK_CLIENT_SECRET` em `backend/.env`. O service account desse client já vem com as permissões de gerenciamento de usuários necessárias.

Backend (Java 21 e Maven):

```bash
cd backend
cp .env.example .env
make up
```

Frontend (Node.js):

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8081/v1/users |
| Keycloak | http://localhost:8080 |
| MailHog | http://localhost:8025 |

O serviço Flyway executa `backend/src/main/resources/db/migration` ao subir o Compose. Emails enviados pelo Keycloak são capturados pelo MailHog; abra a interface em `http://localhost:8025`.

Console admin do Keycloak: `admin` / `admin`. No canto superior esquerdo, troque o realm `master` para `demo`.

## Contas

O realm não inclui contas interativas pré-cadastradas. Crie uma conta pela opção **Create account** no frontend. A conta técnica `service-account-backend-client` é usada internamente pela API para gerenciar usuários no Keycloak.

## Endpoints

| Método | Caminho | Auth |
|---|---|---|
| `POST` | `/v1/users` | livre |
| `GET` | `/v1/users` | público (filtros e paginação) |
| `GET` | `/v1/users/me` | JWT |
| `GET` | `/v1/users/{username}` | público |
| `PUT` | `/v1/users/{username}` | JWT + usuário dono ou role `admin` |
| `DELETE` | `/v1/users/{username}` | JWT + usuário dono ou role `admin` |
| `PATCH` | `/v1/users/{username}/email` | JWT + usuário dono ou role `admin` |

A troca de email é iniciada separadamente: o Keycloak pede reautenticação, solicita o novo endereço e só altera a conta depois da confirmação enviada para esse endereço.
O Keycloak exige a verificação do email no login. Contas ainda não verificadas recebem a etapa de confirmação antes de acessar a aplicação. O `verifyEmail` do arquivo de importação só se aplica quando o realm é criado; para atualizar um realm já existente, habilite **Realm settings → Login → Verify email** (ou recrie o realm com `docker compose down -v`).

Sem token, `/v1/users/me` responde **401**. As rotas administrativas exigem uma conta à qual a role `admin` tenha sido atribuída.

## Fluxo

1. O frontend redireciona para o Keycloak com PKCE.
2. O usuário autentica e o Keycloak devolve um `code`.
3. O frontend troca o `code` por access token, refresh token e id token.
4. As chamadas autenticadas vão com `Authorization: Bearer <access_token>`.
5. O Java valida o JWT nas chaves JWKS do realm `demo` e lê `realm_access.roles`.

O issuer e o endpoint JWKS do token usam `http://localhost:8080/realms/demo`, acessível pelo backend rodando no host.

## Estrutura

```
.
├── compose.yaml      Keycloak, Postgres, Flyway e MailHog
├── infra/realm-demo.json
├── backend/          Spring Boot 3.4 · Java 21 · resource server
└── frontend/         React · Vite · keycloak-js
```

- `frontend/` usa `keycloak-js` para autenticação, Axios para chamadas à API e componentes shadcn nas telas de cadastro e perfil.
- `backend/` é stateless. Roles do token viram `ROLE_USER` / `ROLE_ADMIN`.
- `infra/realm-demo.json` define o realm `demo` e os clients `frontend` e `backend-client`, sem contas interativas pré-cadastradas.

## Resetar o realm

Alterações feitas na UI do Keycloak ficam no Postgres. Para voltar ao JSON inicial:

```bash
docker compose down -v
docker compose up
```

Sem `-v` o import não roda de novo.

## Parar

```bash
docker compose down
```
