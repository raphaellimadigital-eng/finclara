# MELHORIAS — O que falta para o FinClara ser completo e confiável

> Análise sob a ótica de economista sênior (finanças pessoais) + visão de produto fintech,
> aplicada às páginas Relatórios, Perfil, Segurança, Configurações e Ajuda e Suporte.
> Nenhuma implementação foi feita — este documento é só diagnóstico, para aprovação antes de
> qualquer trabalho de código.

---

## 1. Relatórios

**O que já existe:**
- Relatório Mensal (PDF): receitas x despesas, gastos por categoria, evolução de metas do mês.
- Diagnóstico Financeiro (PDF, com IA): prioridade atual + análise personalizada.
- Extrato de Lançamentos (CSV, pronto para Excel/Google Planilhas).
- Comparativo Mensal (PDF): mês atual x mês anterior, com aviso quando não há dado suficiente.
- Evolução Patrimonial (PDF): metas acumuladas menos dívidas, mês a mês.
- Filtro por mês via `SeletorMes` (não por trimestre/ano/personalizado).

**O que está faltando (essencial):**
- **Filtro por período maior que um mês** (trimestre, ano, personalizado) — hoje todo relatório é mês a mês; quem quer ver "o ano inteiro" ou "desde que comecei a usar" não consegue.
- **Relatório voltado à declaração de Imposto de Renda** — o app já coleta CPF (obrigatório no cadastro) mas não gera nenhum documento formatado para "bens e direitos" ou "rendimentos" na época de declaração. É um diferencial forte de confiança para um app financeiro brasileiro, e hoje é ausência total.
- **Progresso da regra 50/30/20 (ou adaptada) ao longo do tempo** — o dashboard mostra o comparativo do mês atual (`GraficoAlocacao`), mas não existe um relatório histórico mostrando se o usuário está melhorando ou piorando a alocação mês a mês.

**O que seria diferencial (bom ter, não obrigatório):**
- Exportar os outros relatórios (Comparativo, Diagnóstico) também em CSV, não só em PDF — para quem quer editar os números, não só ler.
- Gráfico de evolução do saldo interativo na própria tela de Relatórios (hoje só existe em PDF ou no card resumido do dashboard).

**Prioridade:** 🔴 Alta — filtro de período personalizado e relatório para IR. 🟡 Média — histórico da 50/30/20 e exportação CSV adicional.

---

## 2. Perfil

**O que já existe:**
- Dados pessoais: nome, e-mail (não editável), telefone, endereço, CPF, data de nascimento.
- Perfil de investidor (link para questionário em página própria).
- Card de assinatura (Free/Pro/trial).

**O que está faltando (essencial):**
- **Renda mensal declarada** — não existe nenhum campo para isso. Hoje o app só enxerga "renda" como a soma dos lançamentos tipo Receita do mês corrente — ou seja, se o usuário ainda não lançou nada, todo o motor de sugestão (50/30/20, reserva ideal, orientação) fica sem nenhuma referência. Um campo de renda mensal declarada no Perfil permitiria simulações e sugestões *antes* do primeiro lançamento, além de servir de fallback quando o mês está incompleto.
- **Objetivo financeiro principal** — não existe. O motor de orientação hoje só sabe "quitar dívida → reserva → investir", mas não sabe *para quê* o usuário está guardando dinheiro (casa própria, aposentadoria, ficar livre de dívidas). Isso empobrece o tom das sugestões, que hoje são genéricas para todo mundo na mesma prioridade.

**O que seria diferencial (bom ter, não obrigatório):**
- Foto/avatar — cosmético, não afeta nenhuma funcionalidade financeira.
- Edição do perfil de investidor diretamente nesta tela (hoje é um link para página separada) — só reduz um clique.

**Prioridade:** 🔴 Alta — renda mensal declarada (é a base de cálculo que falta para o produto funcionar bem mesmo com pouco histórico de uso). 🟡 Média — objetivo financeiro principal. 🟢 Baixa — avatar.

---

## 3. Segurança

**O que já existe:**
- Alteração de senha.
- Autenticação de dois fatores (TOTP).
- Exportar dados (JSON) e excluir conta permanentemente (ambos already alinhados à LGPD).

**O que está faltando (essencial):**
- **Histórico de acessos/dispositivos conectados** — não existe. Em um app que guarda dado financeiro sensível (dívidas, patrimônio, CPF), a ausência de "veja de onde sua conta foi acessada" é uma lacuna de confiança relevante, não só estética.
- **Logout remoto de outros dispositivos** — não existe. O Supabase Auth (usado no projeto) já suporta invalidar sessões; falta expor isso na UI. Junto com o item anterior, é o par que resolve "esqueci a sessão aberta no computador do trabalho" ou "acho que alguém acessou minha conta".
- **Texto explícito de política de dados nesta própria tela** — hoje o app tem Termos de Uso/Privacidade (link em Ajuda e no rodapé do cadastro), mas a tela de Segurança — que é exatamente onde o usuário pensa "onde meus dados ficam guardados?" — não tem nenhuma linha sobre isso, só os botões de exportar/excluir.

**O que seria diferencial (bom ter, não obrigatório):**
- Notificação por e-mail ao detectar login de novo dispositivo/localização.

**Prioridade:** 🔴 Alta — histórico de acessos + logout remoto (segurança de conta financeira não é opcional). 🟡 Média — texto de política de dados nesta tela (hoje existe em outro lugar, só não está aqui).

---

## 4. Configurações

**O que já existe:**
- Alternância de tema claro/escuro. Só isso — é a página mais vazia do app hoje.

**O que está faltando (essencial):**
- **Sistema de notificações** — não existe absolutamente nenhuma notificação no app hoje (nem push, nem e-mail, nem in-app), e por consequência não há nada para ativar/desativar. Isso é o maior buraco de retenção do produto: alertas de "conta a vencer", "meta atingida", "sobra do mês disponível" e "dívida alta" são exatamente o tipo de gancho que traz o usuário de volta ao app — hoje ele só descobre essas coisas se abrir o app e ler a Central de Alertas.
- **Categorias personalizadas** — todas as categorias (receita, despesa, investimento) são um enum fixo do Prisma; não há como o usuário criar/editar/excluir uma categoria própria. Para o público-alvo "qualquer faixa de renda", isso pode incomodar quem tem uma despesa recorrente que não se encaixa bem em nenhuma das opções fixas (ex: pensão alimentícia, cuidados com animal de estimação, mensalidade de academia como categoria própria em vez de cair em "Outras despesas").

**O que seria diferencial (bom ter, não obrigatório):**
- Atalho para gerenciar cartões/contas conectadas direto desta tela (a função já existe em `/dashboard/cartoes`, só não tem link de conveniência aqui).
- Exportar/importar em formato planilha (hoje a exportação existe só como JSON, em Segurança).
- Preparar moeda/formato de data para expansão futura (hoje fixo em BRL/DD-MM-AAAA no código) — não é problema agora, mas trava internacionalização se um dia for necessário.

**Prioridade:** 🔴 Alta — sistema de notificações e categorias personalizadas (as duas lacunas de produto mais visíveis desta tela). 🟡 Média — atalho de gerenciamento de contas. 🟢 Baixa — import/export em planilha e preparação de i18n.

---

## 5. Ajuda e Suporte

**O que já existe:**
- Pergunta à IA (componente próprio).
- Mini-FAQ informal (4 perguntas fixas, sem busca nem categorização).
- Canal de contato: WhatsApp e formulário de e-mail.
- Link para Termos de Uso e Privacidade.

**O que está faltando (essencial):**
- **Glossário de termos financeiros simples** — não existe um glossário centralizado (reserva de emergência, renda fixa, renda variável, dívida cara, etc.). O app usa `InfoTooltip` pontualmente em alguns cards, mas não há um lugar único para consultar — e isso vai direto contra a promessa central do produto ("linguagem simples que qualquer brasileiro entende"): o próprio produto assume que o usuário pode não conhecer os termos, mas não oferece onde aprendê-los fora do contexto pontual de cada tela.
- **Onboarding revisável a qualquer momento** — o onboarding de 3 passos (implementado recentemente) só aparece automaticamente quando o dashboard está vazio, e some sozinho quando os passos são concluídos. Não há como o usuário voltar a vê-lo deliberadamente depois (ex: esqueceu como funciona algo, ou quer mostrar o app para outra pessoa da família).
- **FAQ estruturada** — a mini-FAQ atual são 4 parágrafos fixos no corpo da página, sem estrutura de pergunta/resposta pesquisável nem categorias — funciona, mas não escala se crescer.

**O que seria diferencial (bom ter, não obrigatório):**
- Versão do app / changelog — não existe em nenhum lugar; é comum em apps financeiros para transmitir que o produto está ativo e mantido.
- Chat ao vivo (hoje o contato humano é só WhatsApp/e-mail).

**Prioridade:** 🔴 Alta — glossário de termos financeiros (alinhado à promessa central do produto) e onboarding revisável a qualquer momento (custo baixo, ganho de usabilidade real). 🟡 Média — FAQ estruturada. 🟢 Baixa — changelog e chat ao vivo.

---

## Lista consolidada de prioridade ALTA (recomendação de implementação antes da comercialização)

Ordenado pelo que considero mais indispensável para o app ser confiável e "completo" primeiro:

1. **Histórico de acessos/dispositivos + logout remoto** (Segurança) — em um app que guarda CPF, dívidas e patrimônio, isso não é opcional para transmitir confiança.
2. **Sistema de notificações** (Configurações) — sem isso, o produto depende 100% do usuário lembrar de abrir o app; é o maior risco de abandono silencioso.
3. **Renda mensal declarada** (Perfil) — destrava sugestões financeiras úteis mesmo antes do primeiro lançamento do mês.
4. **Glossário de termos financeiros simples** (Ajuda) — é a lacuna mais direta contra a proposta de valor central do produto ("qualquer pessoa, com qualquer renda, consegue organizar suas finanças").
5. **Categorias personalizadas** (Configurações) — remove o maior ponto de atrito de quem tem uma realidade financeira que não se encaixa no enum fixo de categorias.
6. **Filtro de período personalizado nos relatórios** (Relatórios) — hoje o usuário não consegue ver "o ano inteiro", só mês a mês.
7. **Relatório para declaração de Imposto de Renda** (Relatórios) — diferencial de confiança sazonal, mas de alto impacto quando chega a época.
8. **Onboarding revisável a qualquer momento** (Ajuda) — custo de implementação baixo frente ao ganho de usabilidade.

Os demais itens marcados como Alta dentro de cada seção (texto de política de dados em Segurança, objetivo financeiro em Perfil, histórico de alocação em Relatórios) são importantes mas de impacto mais incremental — ficariam numa segunda leva, logo depois desta lista.
