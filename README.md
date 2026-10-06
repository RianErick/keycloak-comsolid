# setup-keycloak-consolid

Ambiente local de Keycloak com uma SPA em JavaScript (sem framework) e um resource server em Java. Tudo sobe com Docker Compose.

O browser autentica no Keycloak (Authorization Code + PKCE), recebe um JWT e chama a API. O Spring Boot não faz login: só valida a assinatura do token e autoriza pela role.

## Como rodar

```bash
docker compose up --build
```

Na primeira subida o Maven baixa dependências e o Keycloak importa o realm. Espere o Keycloak ficar pronto (cerca de 1 minuto) e abra http://localhost:3000.

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8081/api/public |
| Keycloak | http://localhost:8080 |

Console admin do Keycloak: `admin` / `admin`. No canto superior esquerdo, troque o realm `master` para `demo`.

## Usuários

| Usuário | Senha | Roles |
|---|---|---|
| `alice` | `alice123` | `user` |
| `bob` | `bob123` | `user`, `admin` |

## Endpoints

| Método | Caminho | Auth |
|---|---|---|
| `GET` | `/api/public` | livre |
| `GET` | `/api/me` | JWT |
| `GET` | `/api/admin` | JWT + role `admin` |

Sem token, `/api/me` responde **401**. Com a Alice, `/api/admin` responde **403**. Com o Bob, **200**.

## Fluxo

1. O frontend redireciona para o Keycloak com PKCE.
2. O usuário autentica e o Keycloak devolve um `code`.
3. O frontend troca o `code` por access token, refresh token e id token.
4. As chamadas autenticadas vão com `Authorization: Bearer <access_token>`.
5. O Java valida o JWT nas chaves JWKS do realm `demo` e lê `realm_access.roles`.

O issuer do token é `http://localhost:8080/realms/demo` (o que o browser vê). O backend busca as chaves em `http://keycloak:8080/.../certs` (hostname interno do Compose).

## Estrutura

```
.
├── docker-compose.yml
├── keycloak/realm-demo.json
├── backend/          Spring Boot 3.4 · Java 21 · resource server
└── frontend/         HTML, CSS e JS · nginx
```

- `frontend/` implementa o OIDC na unha (sem `keycloak-js`).
- `backend/` é stateless. Roles do token viram `ROLE_USER` / `ROLE_ADMIN`.
- `keycloak/realm-demo.json` define o realm `demo`, o client público `frontend` e os dois usuários.

## Resetar o realm

Alterações feitas na UI do Keycloak ficam no Postgres. Para voltar ao JSON inicial:

```bash
docker compose down -v
docker compose up --build
```

Sem `-v` o import não roda de novo.

## Parar

```bash
docker compose down
```
