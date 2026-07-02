# FinClara

Controle financeiro pessoal: receitas, despesas, cartões de crédito, dívidas, metas, perfil de
investidor, motor de orientação financeira, alertas, relatórios em PDF e autenticação em dois
fatores — tudo num único painel.

---

## O que essa versão entrega

- Login, cadastro e autenticação em dois fatores (TOTP) via Supabase Auth
- Lançamento de receitas, despesas e investimentos, com sugestão automática de categoria e
  recorrência real (gera os próximos 12 meses de verdade)
- Cartões de crédito com fechamento, vencimento, compras parceladas e limite disponível
- Dívidas com prioridade de quitação por taxa de juros
- Metas financeiras com projeção de prazo
- Perfil de investidor (questionário) e motor de orientação (dívida cara → reserva de emergência
  → investir)
- Limites de gasto por categoria com alertas de aviso (80%) e estouro (100%)
- Central de alertas (limites, faturas de cartão, vencimento de dívida, metas atrasadas)
- Relatório mensal em PDF (receitas x despesas, gastos por categoria, evolução das metas)
- Exportação e exclusão de dados financeiros (LGPD)
- Modo claro/escuro

---

## Pré-requisitos

- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com) — para banco de dados e autenticação
- Conta no [Vercel](https://vercel.com) — para publicar (já usa)
- Chave de API do [Google Gemini](https://aistudio.google.com/) (opcional, para a recomendação por IA)

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
DIRECT_URL="postgresql://postgres:SUA-SENHA@db.SEU-PROJETO.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA-ANON-KEY"
GEMINI_API_KEY="SUA-CHAVE-GEMINI"
```

---

## 4. Criar/atualizar as tabelas no banco

```bash
npx prisma migrate dev
```

Isso aplica todas as migrations do projeto (usuários, lançamentos, dívidas, cartões, metas,
limites por categoria, etc.) no seu banco Supabase.

> **Windows:** se o comando falhar com `EPERM` ao gerar o Prisma Client, é porque um `next dev`
> anterior ainda está rodando e travando o arquivo `.prisma/client/query_engine-windows.dll.node`.
> Feche o processo (`Ctrl+C` no terminal do `npm run dev`, ou finalize o processo `node.exe`
> correspondente) e rode a migration de novo.

---

## 5. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 — vai pedir para criar uma conta na primeira vez.

---

## 6. Rodar os testes

```bash
npm run test        # roda a suíte uma vez
npm run test:watch  # modo watch, útil durante o desenvolvimento
```

Os testes usam [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) e
cobrem:

- Regras de negócio puras em `lib/*.ts` (dívidas, cartões, metas, motor de orientação, alocação
  50/30/20, limites por categoria, alertas, categorização automática, perfil de investidor,
  relatório)
- Componentes principais da Home (`components/*.test.tsx`): Resumo, CardCartoes, CardDividas,
  CardMetas, FormLancamento, ListaLancamentos

Não há testes de integração com banco isolado nem Cypress E2E ainda — o projeto usa o mesmo banco
Supabase em desenvolvimento e produção, então isso exigiria configurar um banco de testes separado
primeiro (ver seção "Pendências e melhorias futuras").

---

## 7. Publicar no Vercel

```bash
# Se ainda não tem o CLI do Vercel:
npm install -g vercel

vercel
```

No painel do Vercel, vá em **Settings → Environment Variables** e adicione as mesmas variáveis do
`.env.local`.

Depois, rode a migration no banco de produção (pule esse passo se dev e produção usarem o mesmo
banco, como é o caso deste projeto hoje):

```bash
DATABASE_URL="sua-url-de-producao" npx prisma migrate deploy
```

---

## Publicar num Azure DevOps pessoal

O projeto já está pronto para ser espelhado num repositório Git do Azure DevOps:

1. Crie uma organização e um projeto em [dev.azure.com](https://dev.azure.com) (gratuito para uso pessoal)
2. No projeto, vá em **Repos** e copie a URL do repositório Git (formato
   `https://dev.azure.com/SUA-ORG/SEU-PROJETO/_git/SEU-REPO`)
3. Adicione como um segundo remote e envie o código:

   ```bash
   git remote add azure https://dev.azure.com/SUA-ORG/SEU-PROJETO/_git/SEU-REPO
   git push azure main
   ```

4. Em **Pipelines**, crie uma nova pipeline apontando para o arquivo `azure-pipelines.yml` já
   incluído no repositório (instala dependências, roda `tsc`, testes e build a cada push/PR na
   `main` — usa variáveis de ambiente placeholder, sem tocar no banco real)

Nenhuma chave, senha ou token está commitada no repositório — confira `.gitignore` e `.env.example`.

---

## Estrutura do projeto

```
finclara/
├── app/
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Redireciona para /login ou /dashboard
│   ├── globals.css               # Estilos globais (tema claro/escuro, componentes)
│   ├── login/page.tsx            # Login/cadastro + desafio de 2FA
│   ├── termos/page.tsx           # Termos de uso e privacidade (LGPD)
│   └── dashboard/
│       ├── page.tsx              # Home: resumo, alertas, metas, cartões, dívidas, lançamentos
│       ├── actions.ts            # Server Actions de lançamentos (CRUD + recorrência)
│       ├── ai-actions.ts         # Recomendação personalizada via Gemini
│       ├── dividas/              # Dívidas: CRUD + priorização por juros
│       ├── cartoes/              # Cartões de crédito + compras parceladas
│       ├── metas/                # Metas financeiras + aportes
│       ├── perfil/               # Dados cadastrais + questionário de perfil de investidor
│       ├── orientacao/           # Motor de orientação (dívida → reserva → investir)
│       ├── limites/              # Limites de gasto por categoria
│       ├── alertas/              # Central de alertas
│       ├── relatorios/           # Menu de relatórios (seleção de mês + link do PDF)
│       ├── relatorio/            # Route handler que gera o PDF mensal
│       ├── exportar/             # Route handler que exporta os dados em JSON (LGPD)
│       └── configuracoes/        # Aparência, 2FA, exportar/excluir dados
├── components/                   # Componentes de UI (cards, formulários, listas)
├── lib/                          # Regras de negócio puras + clientes Prisma/Supabase/Gemini
│   └── *.test.ts                 # Testes unitários das regras de negócio
├── middleware.ts                 # Protege as rotas /dashboard/* (redireciona se não logado)
├── prisma/
│   ├── schema.prisma             # Modelo de dados completo
│   └── migrations/                # Histórico de migrations
├── .github/workflows/ci.yml      # Pipeline de CI (GitHub Actions)
├── azure-pipelines.yml           # Pipeline de CI (Azure DevOps)
├── .env.example
└── package.json
```

---

## Fases implementadas

O projeto foi construído de forma incremental a partir de uma proposta inicial
(`FinClara_Proposta.docx`, não versionada — contém rascunho de negócio). Cada fase abaixo é um
conjunto de funcionalidades entregue e testado antes de avançar para a próxima:

1. **Base do app** — cadastro, login, lançamento de receitas/despesas, dashboard mensal.
2. **Dívidas** — cadastro de dívidas com taxa de juros e ordenação por prioridade de quitação.
3. **Cartões de crédito** — cadastro de cartões, compras parceladas, cálculo de fatura e limite
   disponível respeitando o dia de fechamento.
4. **Metas financeiras** — cadastro de metas, aportes e projeção de prazo (concluída/atrasada/no
   prazo) com base no ritmo de aportes.
5. **Perfil de investidor e motor de orientação** — o questionário em `/dashboard/perfil` classifica
   o usuário como conservador, moderado ou arrojado (`lib/perfilInvestidor.ts`). A tela
   `/dashboard/orientacao` (`lib/orientacao.ts`) usa essa classificação junto com a situação
   financeira atual para recomendar **uma única prioridade por vez**, nesta ordem: (1) se há
   dívida com juros acima de 2% ao mês, quitar essa dívida antes de qualquer investimento; (2) se
   não há dívida cara mas a reserva de emergência (soma das metas do tipo "Reserva de emergência")
   ainda não cobre 3 meses de gastos essenciais, formar essa reserva; (3) só então recomenda
   investir, calibrando o tom do texto pelo perfil. O card "Orientação financeira" na Home é um
   resumo dessa tela — não é uma etapa separada de configuração, é uma recomendação que se
   recalcula sozinha toda vez que a situação financeira muda (novo lançamento, aporte em meta,
   nova dívida, etc.).
6. **Automação de lançamento** — sugestão automática de categoria por palavra-chave na descrição
   (`lib/categorizacao.ts`) e recorrência real: lançamentos marcados como recorrentes já nascem com
   as ocorrências dos próximos 12 meses criadas.
7. **Limites e alertas** — limite de gasto mensal por categoria (aviso em 80%, estouro em 100%) e
   central de alertas reunindo limites, vencimento de fatura/dívida e metas atrasadas. O indicador
   de risco do resumo passou a somar faturas de cartão e parcelas de dívida, não só despesas
   lançadas diretamente.
8. **Relatórios** — relatório mensal em PDF com receitas x despesas, gastos por categoria e
   evolução das metas.
9. **Segurança e LGPD** — autenticação em dois fatores (TOTP, via Supabase Auth MFA nativo),
   exportação de dados em JSON e exclusão de todos os dados financeiros (mantendo o login ativo).
10. **Qualidade** — testes unitários (Vitest) das regras de negócio e dos componentes principais,
    pipeline de CI (GitHub Actions e Azure DevOps).

---

## Pendências e melhorias futuras

- Edição de nome, telefone e endereço em Dados cadastrais (hoje só exibe, não edita)
- Testes de integração com banco isolado e testes end-to-end (Cypress) — exigem configurar um
  banco de testes separado do de desenvolvimento/produção
- Exclusão de conta completa (removendo o login no Supabase Auth, não só os dados financeiros) —
  exigiria configurar a chave `service_role` do Supabase
- Comparativos anuais/trimestrais, evolução patrimonial consolidada, import de CSV/OFX, Open
  Finance, modo família e simuladores (funcionalidades de fases futuras)
