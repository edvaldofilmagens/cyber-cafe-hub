# Conecta Remígio — Backend API

API Node.js + Express + Prisma + PostgreSQL para o sistema Conecta Remígio.

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- npm ou yarn

## Instalação

```bash
cd server

# Instalar dependências
npm install

# Configurar banco de dados
cp .env.example .env
# Edite o .env com sua URL do PostgreSQL e JWT_SECRET

# Rodar migrations
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# Seed (dados iniciais: admin + funcionário + produtos)
npm run prisma:seed

# Iniciar em modo desenvolvimento
npm run dev
```

## Produção (Ubuntu)

```bash
# Build
npm run build

# Rodar com PM2
npm install -g pm2
pm2 start dist/index.js --name conecta-api

# Ou com systemd
# Crie um service file em /etc/systemd/system/conecta-api.service
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `JWT_SECRET` | Chave secreta para tokens JWT |
| `PORT` | Porta do servidor (padrão: 3001) |

## Endpoints

### Auth
- `POST /api/auth/login` — Login (email + senha)
- `GET /api/auth/me` — Dados do usuário logado

### Users (admin only)
- `GET /api/users` — Listar usuários
- `POST /api/users` — Criar usuário
- `PUT /api/users/:id` — Atualizar usuário
- `DELETE /api/users/:id` — Desativar usuário

### Orders
- `GET /api/orders` — Listar comandas (filtro: `?status=aberta,paga&source=mesa`)
- `GET /api/orders/:id` — Detalhes da comanda
- `GET /api/orders/source/:source/:sourceId` — Buscar comanda ativa por origem
- `POST /api/orders` — Criar comanda
- `POST /api/orders/:id/items` — Adicionar item
- `PUT /api/orders/:id/items/:productId` — Alterar quantidade
- `DELETE /api/orders/:id/items/:productId` — Remover item
- `PUT /api/orders/:id/send-to-payment` — Enviar para pagamento
- `PUT /api/orders/:id/finalize` — Finalizar (baixa estoque)
- `PUT /api/orders/:id/cancel` — Cancelar

### Products (admin para criar/editar)
- `GET /api/products` — Listar produtos ativos
- `POST /api/products` — Criar produto
- `PUT /api/products/:id` — Atualizar
- `DELETE /api/products/:id` — Desativar

### Reports
- `GET /api/reports/daily?date=2026-04-11` — Relatório diário

### Accounts (Financeiro — admin only)
- `GET /api/accounts` — Listar contas a pagar/receber
- `POST /api/accounts` — Criar conta
- `PUT /api/accounts/:id` — Atualizar (incluindo status)
- `DELETE /api/accounts/:id` — Remover

### Vouchers (admin only)
- `GET /api/vouchers` — Listar vouchers
- `POST /api/vouchers` — Gerar N vouchers `{ hours, price, qty }`
- `PUT /api/vouchers/:id` — Atualizar
- `DELETE /api/vouchers/:id` — Remover

## Conectar Frontend

No frontend React, crie um arquivo `.env`:

```
VITE_API_URL=http://seu-servidor:3001
```

⚠️ **Sem essa variável, o frontend NÃO funciona** (não há mais fallback de localStorage).

## Atualizando o schema

Sempre que `schema.prisma` mudar, rode:

```bash
npx prisma migrate dev --name nome-da-mudanca
npx prisma generate
```

## Permissões

| Recurso | Admin | Funcionário |
|---------|-------|-------------|
| Dashboard | ✅ | ❌ |
| PDV | ✅ | ✅ |
| Mesas | ✅ | ✅ |
| Computadores | ✅ | ✅ |
| Estoque | ✅ | ❌ |
| Financeiro | ✅ | ❌ |
| Vouchers | ✅ | ❌ |
| Usuários | ✅ | ❌ |
