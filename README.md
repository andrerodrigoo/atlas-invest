# Atlas Invest — Projeto Completo (Backend + Web App)

Este pacote contém o **backend completo** (API + banco de dados) e um
**web app funcional** (frontend) do Atlas Invest, prontos para rodar juntos
com um único comando.

```
atlas-invest/
  backend/    # API Node.js + TypeScript + Prisma/PostgreSQL
  frontend/   # Web app React (Login, Dashboard, Carteira, IA, Notícias, Perfil, Premium)
  docker-compose.yml
```

## Sobre "baixar o aplicativo"

Boas notícias: o projeto agora inclui um **projeto Android nativo pronto**
(gerado via Capacitor a partir do web app), que gera um **arquivo `.apk`
instalável de verdade** no celular — não é só o navegador.

O que eu **não consigo fazer aqui no chat** é rodar o Android Studio e
compilar o `.apk` final por você — isso exige o SDK do Android, que só
existe instalando o Android Studio no seu computador. Mas todo o código
já está pronto; o que falta é um build de poucos cliques.

**Siga o guia passo a passo em `frontend/COMO_GERAR_O_APK.md`** — ele
te leva desde instalar o Android Studio até ter o `app-debug.apk` no seu
celular, instalável como qualquer outro app.

Resumo rápido (detalhes completos no guia):
```bash
cd frontend
npm install
npm run cap:sync          # builda o React e sincroniza com o projeto Android
npm run cap:open:android  # abre no Android Studio
```
No Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)** →
o `.apk` aparece em `frontend/android/app/build/outputs/apk/debug/`.

Se preferir só testar rapidinho sem gerar `.apk`, o web app comum
(`localhost:8080` via Docker) continua funcionando normalmente e também
pode ser "instalado" como PWA pelo navegador do celular — mas o `.apk`
gerado pelo Capacitor é um app nativo de verdade, mais próximo do que
você provavelmente imagina como "aplicativo baixável".

## Como rodar tudo com um único comando

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
cd atlas-invest
docker compose up --build
```

Isso sobe três serviços:

| Serviço | O que é | Endereço |
|---|---|---|
| `postgres` | Banco de dados | `localhost:5432` |
| `api` | Backend (Node.js/Express) | `http://localhost:3000` |
| `web` | Web app (React, servido via nginx) | `http://localhost:8080` |

Na primeira subida, o backend aplica as migrações e popula o banco
automaticamente com dados de teste.

**Abra `http://localhost:8080` no navegador** — essa é a "tela inicial"
do app. Use para entrar:

| Tipo | E-mail | Senha |
|---|---|---|
| Usuário de teste | `teste@atlasinvest.com.br` | `Teste123` |
| Administrador (via API, sem tela própria ainda) | `admin@atlasinvest.com.br` | `Admin123` |

O usuário de teste já vem com uma carteira ("Carteira Principal") com
100 PETR4 a R$32,50, pronta para explorar.

## O que dá para testar no web app

- **Login/Cadastro** — cadastro completo com fluxo de confirmação de
  e-mail simplificado para teste (Parte 13)
- **Dashboard** — patrimônio total, atalhos, notícias em destaque
- **Carteira** — criar carteiras, registrar compra/venda de ativos, ver
  quantidade e preço médio recalculados automaticamente
- **Assistente IA** — chat com respostas educativas (Parte 17: nunca
  recomenda compra/venda)
- **Notícias** — lista de notícias com resumo, categoria e fonte
- **Premium** — status da assinatura, iniciar teste grátis (uma vez por
  conta), cancelar
- **Perfil** — dados do usuário logado, encerrar sessão

O **painel administrativo** (`/admin/*`) está pronto no backend, mas ainda
sem tela própria no web app — pode ser testado diretamente pela API (veja
`backend/tests-manual/atlas-invest.http`).

## Rodando sem Docker (desenvolvimento)

**Backend:**
```bash
cd backend
cp .env.example .env    # edite com suas credenciais de Postgres
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev              # http://localhost:3000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env      # aponta para http://localhost:3000/api/v1 por padrão
npm install
npm run dev                # http://localhost:5173
```

> Nota: neste ambiente de geração de arquivos eu não tenho acesso à
> internet para baixar os binários do Prisma Engine, então não consegui
> rodar as migrações/seed do backend aqui — mas **testei a compilação do
> frontend com `npm run build` e funcionou 100% sem erros**. O backend foi
> revisado com `tsc --noEmit`; os únicos erros restantes são a ausência do
> client do Prisma (que se resolve sozinho com `npx prisma generate` ou
> rodando via Docker).

## Documentação detalhada

- `backend/README.md` — todos os endpoints, regras de negócio aplicadas,
  o que é mock/placeholder (e-mail, pagamento, cotações em tempo real,
  push notifications) e arquitetura em camadas
- `backend/tests-manual/atlas-invest.http` — todas as requisições da API
  prontas para testar (via extensão REST Client do VS Code ou Postman)

## Próximos passos sugeridos

1. Testar o fluxo completo pelo web app (`localhost:8080`)
2. Me dar feedback do que ajustar nas telas ou regras de negócio
3. Conectar provedores reais (e-mail, IA, cotações, pagamento) quando
   você tiver as credenciais
4. Se quiser um app nativo publicável nas lojas, começar um projeto
   Flutter/React Native separado consumindo esta API
