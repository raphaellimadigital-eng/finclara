# FinClara — Guia do Projeto

App de finanças pessoais para o mercado brasileiro. Objetivo: qualquer pessoa, com qualquer renda, consegue organizar suas finanças, economizar e fazer o dinheiro render. Produto solo em fase de MVP com plano de comercialização.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Banco/Auth:** Supabase (PostgreSQL) via Prisma
- **Deploy:** Vercel
- **Estilo:** Tailwind CSS

## Comandos

```bash
npm run dev        # ambiente local
npm run build      # build de produção — SEMPRE rodar antes de finalizar uma tarefa
npm run lint       # lint
npx prisma studio  # inspecionar o banco
npx prisma migrate dev --name <nome>  # nova migration
```

## Regras de código

- TypeScript estrito: nunca usar `any`. Tipar props, retornos de API e modelos do Prisma.
- Componentes reutilizáveis em `/components`, um componente por arquivo, nome em PascalCase.
- Lógica de negócio financeira separada da UI (em `/lib` ou `/services`) — facilita testes.
- Nunca expor chaves no client: variáveis sensíveis só sem prefixo `NEXT_PUBLIC_`.
- Antes de criar componente novo, verificar se já existe um parecido para reutilizar.
- Não quebrar funcionalidades existentes: ao alterar algo, verificar onde é usado.

## Responsividade (obrigatório)

- **Mobile-first:** escrever o CSS base para celular e usar breakpoints do Tailwind (`sm:`, `md:`, `lg:`) para telas maiores.
- Testar todo layout em **375px (celular)** e **1440px (desktop)** no mínimo.
- Alvos de toque com no mínimo 44px de altura em botões e itens clicáveis.
- Tabelas viram cards empilhados no mobile — nunca scroll horizontal forçado.
- Menu de navegação: bottom nav no mobile, sidebar/topbar no desktop.

## Padrões de UI/UX

- Idioma: 100% português do Brasil, linguagem simples (evitar jargão financeiro).
- Moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Datas: formato DD/MM/AAAA.
- Formulários: validação com mensagens claras em português (ex: "Informe um valor maior que zero").
- Feedback visual em toda ação: loading, sucesso e erro.
- Acessibilidade básica: todo input com `label`, contraste adequado, `alt` em imagens.
- Hierarquia do dashboard: card de **saldo do mês** e **regra 50/30/20** sempre em destaque no topo.

## Regras financeiras do produto

- O app **sugere** alocações e investimentos, **nunca ordena** comprar ativo específico.
- Toda sugestão de investimento exibe o aviso: "Isto é uma sugestão educativa, não uma recomendação de investimento."
- Detalhes completos de tom, cálculos e prioridades: ver skill `consultor-financeiro`.

## Testes e qualidade

- Testes E2E com **Cypress** para os fluxos críticos: cadastro/login, adicionar receita, adicionar despesa, criar meta, visualizar dashboard.
- Ao corrigir um bug, criar/atualizar o teste que o cobre.
- Rodar `npm run build` ao final de toda tarefa para garantir que nada quebrou.

## Workflow

- Mudanças estruturais grandes (reorganizar telas, mudar schema do banco): apresentar o plano primeiro e aguardar aprovação antes de implementar.
- Migrations do Prisma: nunca editar migrations antigas, sempre criar uma nova.
- Commits pequenos e descritivos em português (ex: `feat: card de sobra do mês no dashboard`).
