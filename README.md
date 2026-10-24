# Central Lux 4

Central de lançamento pago do Lux (Wigor Macolly × Mari França). Primeiro módulo: pesquisa com as alunas do Lumen.

Stack: Next.js 15 · TypeScript · Postgres 17 · postgres.js. Um app e um Postgres próprio, publicados pelo EasyPanel a partir deste repositório.

## Rotas

| Rota | Quem acessa | O que é |
|---|---|---|
| `/p/lumen` | público | questionário das alunas |
| `/login` | público | entrada da equipe |
| `/primeiro-acesso` | público, uma vez | cria o primeiro administrador com o `SETUP_TOKEN`; fecha sozinho depois |
| `/convite/<token>` | quem recebeu o link | cria a própria senha (link vale 7 dias, uso único) |
| `/`, `/pesquisas`, `/pesquisas/lumen`, `/equipe` | equipe logada | início, respostas, CSV, convites |
| `/api/saude` | público | checagem de saúde para o EasyPanel |

Toda rota fora dessa lista exige sessão. Em dúvida, nega.

## Variáveis de ambiente (EasyPanel → app → Environment)

| Variável | Valor |
|---|---|
| `DATABASE_URL` | "Internal Connection URL" do serviço Postgres do projeto |
| `SETUP_TOKEN` | texto aleatório com 24+ caracteres, usado uma vez em `/primeiro-acesso` |
| `APP_URL` | `https://central.marifrancafotografia.com.br` |
| `TZ` | `America/Sao_Paulo` |

## Publicação (EasyPanel)

1. Projeto `lux` → serviço **Postgres** (`central-db`).
2. Serviço **App** → fonte GitHub `wigormacolly/central-lux4`, branch `main`, build por **Dockerfile**, deploy automático ligado.
3. Variáveis acima. Porta do app: `3000`.
4. Domínio `central.marifrancafotografia.com.br` → porta 3000, HTTPS ligado.
5. Na Hostinger: registro `A` de `central` apontando para o IP do VPS.

As migrations em `db/migrations` rodam sozinhas a cada subida do container. Se uma falhar, o container não sobe.

## Desenvolvimento

```bash
npm install
DATABASE_URL=postgres://... npm run db:migrate
DATABASE_URL=postgres://... SETUP_TOKEN=... npm run dev
```
