# FinClara — MVP Etapa 1

Controle financeiro pessoal: receitas, despesas e dashboard mensal.

---

## O que essa versão entrega

- Login e cadastro de conta (via Supabase Auth)
- Lançamento de receitas e despesas com categoria e data
- Marcar lançamento como recorrente
- Dashboard mensal com total de receitas, despesas, saldo e barra de comprometimento de renda
- Navegação entre meses
- Exclusão de lançamento

---

## Pré-requisitos

- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com) — para banco de dados e autenticação
- Conta no [Vercel](https://vercel.com) — para publicar (já usa)

---

## 1. Clonar e instalar

```bash
npm install
```

---

## 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **Settings → Database → Connection string → URI** e copie a URL de conexão
3. Vá em **Settings → API** e copie a **Project URL** e a **anon key**

---

## 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha:

```
DATABASE_URL="postgresql://postgres:SUA-SENHA@db.SEU-PROJETO.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA-ANON-KEY"
```

---

## 4. Criar as tabelas no banco

```bash
npx prisma migrate dev --name init
```

Isso cria as tabelas `usuarios` e `lancamentos` no seu banco Supabase.

---

## 5. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 — vai pedir para criar uma conta na primeira vez.

---

## 6. Publicar no Vercel

```bash
# Se ainda não tem o CLI do Vercel:
npm install -g vercel

vercel
```

No painel do Vercel, vá em **Settings → Environment Variables** e adicione as mesmas três variáveis do `.env.local`.

Depois, rode a migration no banco de produção:

```bash
DATABASE_URL="sua-url-de-producao" npx prisma migrate deploy
```

---

## Estrutura do projeto

```
finclara/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Redireciona para /login ou /dashboard
│   ├── globals.css         # Estilos globais
│   ├── login/
│   │   └── page.tsx        # Tela de login/cadastro
│   └── dashboard/
│       ├── page.tsx        # Dashboard principal (Server Component)
│       └── actions.ts      # Server Actions: criar, buscar, deletar lançamentos
├── components/
│   ├── FormLancamento.tsx  # Formulário de novo lançamento
│   ├── ListaLancamentos.tsx# Lista com opção de excluir
│   ├── Resumo.tsx          # Card de resumo mensal
│   ├── SeletorMes.tsx      # Navegação entre meses
│   └── BotaoSair.tsx       # Botão de logout
├── lib/
│   ├── prisma.ts           # Instância do Prisma Client
│   ├── supabase-server.ts  # Cliente Supabase para Server Components
│   └── supabase-browser.ts # Cliente Supabase para Client Components
├── middleware.ts            # Proteção de rotas (redireciona se não logado)
├── prisma/
│   └── schema.prisma       # Modelo de dados (Usuario + Lancamento)
├── .env.example
└── package.json
```

---

## Próximos passos (Etapa 2)

- Cartões de crédito com fechamento, vencimento e parcelamentos
- Dívidas com prioridade de quitação
- Metas financeiras com progresso
- Recomendação básica: quitar dívida → reserva → investir
