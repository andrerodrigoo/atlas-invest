# Atlas Invest — Backend

> Este backend agora faz parte do monorepo `atlas-invest/`. Para subir tudo
> de uma vez (banco + API + web app), veja o `README.md` na raiz do
> projeto e rode `docker compose up --build` a partir da pasta `atlas-invest/`
> (não daqui de dentro). As instruções abaixo continuam válidas para rodar
> só o backend isoladamente em desenvolvimento.

Backend completo do Atlas Invest, cobrindo **todos os módulos da
especificação de APIs (Parte 12)**, seguindo o roadmap das Partes 9/15
(autenticação → carteira → IA → Premium/alertas/admin).

## Como testar isoladamente (sem o web app)

```bash
cd atlas-invest      # pasta raiz do monorepo
docker compose up --build
```

Isso sobe o PostgreSQL, aplica as migrações e popula o banco com dados de
teste automaticamente (usuário, admin, ativos, carteira de exemplo e
notícias). A API fica disponível em `http://localhost:3000`.

**Credenciais já prontas (via seed):**

| Tipo | E-mail | Senha |
|---|---|---|
| Usuário comum | `teste@atlasinvest.com.br` | `Teste123` |
| Administrador | `admin@atlasinvest.com.br` | `Admin123` |

O usuário de teste já vem com e-mail confirmado e uma carteira
("Carteira Principal") com 100 PETR4 a R$32,50.

### Testando os endpoints

Abra `tests-manual/atlas-invest.http` — se você usa VS Code, instale a
extensão **REST Client** e clique em "Send Request" acima de cada
requisição (basta colar o `accessToken` retornado no login nas variáveis
do topo do arquivo). Se preferir Postman/Insomnia, o mesmo arquivo serve
de roteiro: todos os endpoints, corpos de requisição e headers estão lá.

### Sem Docker (rodando local)

```bash
cp .env.example .env
# edite o .env com suas credenciais reais de PostgreSQL e segredos fortes

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

npm run dev      # desenvolvimento
npm run build && npm start   # produção
npm test         # testes automatizados
```

> **Nota:** neste ambiente de geração de arquivos eu não tenho acesso à
> internet para baixar os binários do Prisma Engine, então não consegui
> rodar `npx prisma generate`, o build completo nem os testes aqui. Revisei
> tudo com `tsc --noEmit`: os únicos erros apontados são a ausência do
> client gerado (enums como `AccountStatus`, `AssetType` etc.) — eles somem
> automaticamente assim que você rodar `npx prisma generate` no seu
> ambiente ou usar o Docker (que já faz isso pra você).

## Arquitetura em camadas (Parte 22)

```
src/
  api/              # rotas, controllers, middlewares, validadores
  application/       # serviços (regras de negócio)
  domain/             # contratos (ex: AiProvider — troca de modelo de IA sem impacto)
  infrastructure/     # banco (Prisma), segurança (JWT/hash), IA
  config/             # variáveis de ambiente centralizadas
prisma/
  schema.prisma       # modelo completo do banco de dados
  seed.ts             # dados de teste
tests/                # testes automatizados (Jest + Supertest)
tests-manual/          # requisições .http prontas para teste manual
```

## Módulos implementados (Parte 12 — Especificação das APIs)

### Autenticação (Partes 12, 13, 16, 22)
- `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`
- `POST /auth/confirm-email`, `/auth/reset-password` (fluxo completo)
- `GET/PUT/DELETE /users/me`
- `POST /users/me/pin`, `/users/me/pin/verify`

> Como o envio real de e-mail (Parte 18) ainda não está integrado, o token
> de confirmação de e-mail e o token de redefinição de senha são
> retornados diretamente na resposta da API **fora de produção**
> (`NODE_ENV !== "production"`), só para permitir testar o fluxo completo
> sem um provedor de e-mail configurado.

### Carteira, Ativos e Transações (Partes 12, 13, 17)
- `GET/POST/PUT/DELETE /wallets`
- `GET /assets`, `/assets/search`, `/assets/:ticker`, `/assets/:ticker/dividends`
- `GET /atlas-score/:ticker`
- `GET/POST/PUT/DELETE /transactions` — com **recálculo automático de
  quantidade e preço médio** a cada alteração (Parte 13)

Regras de recálculo (custo médio ponderado), reprocessadas do zero a cada
alteração para nunca divergir:
- **COMPRA/APORTE**: aumenta quantidade e recalcula o preço médio ponderado.
- **VENDA/RETIRADA**: reduz a quantidade, mantendo o preço médio da posição.
- **AJUSTE**: sobrepõe quantidade e preço médio diretamente (correção manual).

### Inteligência Artificial (Partes 17, 24)
- `POST /ai/chat`, `GET /ai/history`
- Arquitetura modular: a interface `AiProvider` (`src/domain/ai-provider.ts`)
  isola o resto do sistema da implementação concreta. Hoje usa um
  `MockAiProvider` com respostas educativas de exemplo (nunca recomenda
  compra/venda, sempre menciona limitações). Para plugar um modelo real
  (Claude, GPT etc.), basta criar uma nova classe que implemente
  `AiProvider` e trocar a instância exportada em
  `src/infrastructure/ai/mock-ai-provider.ts` — nenhum controller/rota
  precisa mudar.

### Notícias, Notificações e Alertas (Partes 12, 13, 18)
- `GET /news`, `/news/:id`
- `GET /notifications`, `PUT /notifications/read`
- `GET/POST/DELETE /alerts`

### Premium / Assinaturas (Partes 12, 13)
- `GET /subscriptions`
- `POST /subscriptions/start-trial` — bloqueia reuso do teste grátis por
  conta (`trialUtilizado`), conforme regra de negócio da Parte 13
- `POST /subscriptions/cancel`

### Administração (Partes 12, 13, 14, 16)
- `POST /admin/auth/login` — login administrativo **separado** do login de
  usuários comuns (tabela `admin_users`, papéis `SUPORTE`/`ADMINISTRADOR`)
- `GET /admin/dashboard`, `/admin/users`, `/admin/metrics`
- `POST /admin/notifications` — broadcast de notificações
- Todas protegidas por RBAC (`requireRole`) — somente `suporte` ou
  `administrador` acessam

## Segurança aplicada (Parte 16)

- Senha e PIN nunca em texto puro (bcrypt; PIN com pepper adicional do servidor)
- Refresh tokens armazenados como hash (SHA-256), rotacionados a cada uso
- Rate limiting global, headers de segurança (`helmet`), CORS configurável
- Validação de entrada com Zod em 100% dos endpoints de escrita
- Auditoria de eventos críticos (`audit_logs`): cadastro, login, login
  admin, confirmação de e-mail, redefinição de senha, configuração de PIN
- RBAC nas rotas administrativas
- Segredos apenas via variáveis de ambiente

## O que é mock/placeholder (para você saber o que ainda falta de verdade)

| Item | Status |
|---|---|
| Envio real de e-mail (confirmação, reset de senha) | Não integrado — token retornado na resposta da API para testes (Parte 18 pendente) |
| Respostas de IA | `MockAiProvider` com respostas educativas fixas — pronto para trocar por Claude/GPT real |
| Cotações de mercado em tempo real | Não integrado — `asset_prices` existe no schema, mas sem provedor conectado |
| Pagamentos (Mercado Pago) | Não integrado — `/subscriptions` funciona no nível de regra de negócio (trial/cancelamento), mas sem cobrança real |
| Push notifications (Firebase) | Não integrado — `/notifications` funciona via banco de dados, sem envio para o dispositivo |
| App mobile (Flutter) | **Não incluído nesta entrega.** Este ambiente de chat não tem SDK do Flutter disponível; o que foi entregue é o backend completo. Recomendo abrir um projeto Flutter separado (posso ajudar a estruturar as telas em código, mas a compilação/teste do app precisa ser feita no seu computador) |

## Próximos passos sugeridos

1. Conectar um provedor de e-mail real (Parte 18) e remover os tokens da resposta da API
2. Trocar o `MockAiProvider` por uma integração real de IA
3. Conectar provedor de cotações de mercado e popular `asset_prices` periodicamente
4. Integrar Mercado Pago para cobrança real das assinaturas Premium
5. Construir o app Flutter consumindo esta API (posso ajudar a gerar as telas)
