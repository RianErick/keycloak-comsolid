# Código de demonstração

Este repositório contém o código de demonstração da palestra **“Keycloak na Prática: Autenticação e Autorização em Aplicação Modernas”**, apresentada por **Rian Erick** e **João Pedro Moreira** no **COMSOLID do IFCE Campus Maracanaú**, em **8 de outubro de 2026, das 8h às 9h30**.

## Sobre o projeto

A aplicação demonstra como integrar o Keycloak a uma aplicação web para autenticar usuários e controlar o acesso a recursos protegidos. O projeto inclui um frontend em React, uma API em Java com Spring Boot e um ambiente local com Keycloak e PostgreSQL.

No fluxo apresentado, o frontend encaminha o usuário ao Keycloak para entrar. Depois da autenticação, recebe um token e o utiliza nas chamadas à API. O backend valida esse token e aplica as permissões associadas ao usuário, como o acesso ao próprio perfil ou a operações administrativas.

## Slides da apresentação

- [Baixar os slides (PDF)](docs/presentation/keycloak-na-pratica.pdf)
- [Baixar os slides (PowerPoint)](docs/presentation/keycloak-na-pratica.pptx)

## Executar localmente

Você vai precisar de Docker com Docker Compose, Java 21 e Node.js. O Keycloak e os bancos de dados rodam em containers; o backend e o frontend são iniciados em terminais separados.

1. Na raiz do projeto, crie o arquivo de configuração e inicie os serviços de apoio:

```bash
cp .env.example .env
docker compose up
```

Na primeira inicialização, o Keycloak importa automaticamente o realm `demo`. Aguarde os serviços ficarem prontos antes de continuar.

2. Configure e inicie o backend. Em outro terminal:

```bash
cd backend
cp .env.example .env
```

No console do Keycloak (`http://localhost:8080`), entre no realm `demo`, acesse **Clients → backend-client → Credentials** e copie o client secret para `KEYCLOAK_CLIENT_SECRET` no arquivo `backend/.env`. Depois execute:

```bash
make up
```

3. Configure e inicie o frontend. Em mais um terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

Acesse a aplicação em [http://localhost:5173](http://localhost:5173). O console do Keycloak fica em [http://localhost:8080](http://localhost:8080) (usuário e senha padrão: `admin` / `admin`), e o MailHog, usado para visualizar emails de verificação, em [http://localhost:8025](http://localhost:8025). Para encerrar os serviços de apoio, rode `docker compose down` na raiz do projeto.
