# Modelagem de Banco de Dados (DATABASE.md)

Este documento especifica a estrutura do banco de dados relacional (PostgreSQL) utilizado pelo **BetVision Pro**, implementado por meio do **Prisma ORM**.

---

## 📐 Entidades e Relacionamentos

```
  ┌──────────────┐             ┌──────────────────┐
  │     User     │1 ─────────* │   Subscription   │
  └──────┬───────┘             └──────────────────┘
         │ 1
         │
         │ *
  ┌──────▼───────┐             ┌──────────────────┐
  │   BetSlip    │1 ─────────* │  BetSlipSelection│
  └──────────────┘             └──────────────────┘
```

---

## 🗄️ Esquema das Tabelas (Schema Blueprint)

### 👤 Tabela: `User`
Armazena as credenciais, dados cadastrais e o nível de acesso do investidor.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Identificador único |
| `name` | `VARCHAR(255)` | `NOT NULL` | Nome completo do usuário |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | E-mail para login |
| `password` | `VARCHAR(255)` | `NOT NULL` | Senha criptografada (bcrypt) |
| `role` | `VARCHAR(50)` | `DEFAULT 'FREE'` | Níveis: `'FREE'`, `'VIP'`, `'ADMIN'` |
| `createdAt` | `TIMESTAMP` | `DEFAULT NOW()` | Data de criação |
| `updatedAt` | `TIMESTAMP` | `DEFAULT NOW()` | Data de última modificação |

### 💳 Tabela: `Subscription`
Controla os pagamentos, status e validade das assinaturas VIP.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Identificador único |
| `userId` | `UUID` | `FOREIGN KEY REFERENCES User(id)` | Usuário assinante |
| `status` | `VARCHAR(50)` | `NOT NULL` | Status: `'ACTIVE'`, `'PAST_DUE'`, `'CANCELED'` |
| `planId` | `VARCHAR(100)` | `NOT NULL` | Identificador do plano (ex: `'mensal_vip'`) |
| `currentPeriodEnd` | `TIMESTAMP` | `NOT NULL` | Data de expiração do período atual |
| `createdAt` | `TIMESTAMP` | `DEFAULT NOW()` | Data de assinatura |

### 🎫 Tabela: `BetSlip`
Registra os bilhetes de apostas gerados pela IA ou montados pelo próprio investidor.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Identificador único |
| `userId` | `UUID` | `FOREIGN KEY REFERENCES User(id)` | Dono do bilhete |
| `amount` | `DECIMAL(10, 2)` | `NOT NULL` | Valor investido em reais |
| `totalOdd` | `DECIMAL(10, 2)` | `NOT NULL` | Cotação total acumulada |
| `expectedValue`| `DECIMAL(5, 2)` | `DEFAULT 1.0` | Retorno esperado (+EV) calculado |
| `status` | `VARCHAR(50)` | `DEFAULT 'PENDING'` | Status: `'PENDING'`, `'WON'`, `'LOST'` |
| `createdAt` | `TIMESTAMP` | `DEFAULT NOW()` | Data de criação do bilhete |

### 🎯 Tabela: `BetSlipSelection`
Vincula as partidas específicas selecionadas dentro de um bilhete múltiplo.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Identificador único |
| `betSlipId` | `UUID` | `FOREIGN KEY REFERENCES BetSlip(id)`| Bilhete associado |
| `matchId` | `VARCHAR(100)` | `NOT NULL` | ID da partida da API externa |
| `homeTeam` | `VARCHAR(255)` | `NOT NULL` | Time da casa |
| `awayTeam` | `VARCHAR(255)` | `NOT NULL` | Time visitante |
| `market` | `VARCHAR(100)` | `NOT NULL` | Mercado escolhido (ex: `'Vencedor Casa'`) |
| `odd` | `DECIMAL(10, 2)` | `NOT NULL` | Odd no momento da seleção |
