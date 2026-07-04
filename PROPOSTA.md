# PROPOSTA — Reorganização de telas, cards e linguagem do FinClara

> Fase 2. Baseada na auditoria de `ANALISE.md` (aprovada em 03/07/2026).
> Nada aqui foi implementado ainda — este documento existe para aprovação.
>
> Princípios aplicados: jornada financeira real (visão do mês → o que entrou → o que saiu →
> sobrou/faltou → metas → sugestão de destino), linguagem que qualquer brasileiro entende,
> mobile-first, e a regra permanente: o app **sugere** ("considere", "uma opção seria"),
> **nunca ordena** comprar ativo específico, sempre com o aviso
> "Isto é uma sugestão educativa, não uma recomendação de investimento."

---

## 1. Navegação — a base de tudo

### 1.1 Bottom nav (mobile) e sidebar (desktop)

Hoje a navegação é em estrela (tudo volta para a home) e a tela de Limites é órfã.
Proposta: navegação persistente com **5 destinos**, organizados pela jornada:

| Posição | Item | Ícone | Leva a |
|---|---|---|---|
| 1 | **Início** | casa | `/dashboard` (visão do mês) |
| 2 | **Metas** | alvo | `/dashboard/metas` |
| 3 | **Registrar** (botão central em destaque) | ＋ | abre o formulário de lançamento em bottom-sheet/modal, de qualquer tela |
| 4 | **Contas** | cartão | nova tela-índice agrupando Cartões, Dívidas e Limites por categoria |
| 5 | **Mais** | menu | Alertas, Orientação, Relatórios, Perfil de investidor, Perfil, Segurança, Configurações, Ajuda, Sair |

- No desktop (≥ `lg:`), os mesmos itens viram **sidebar** fixa à esquerda, com os subitens de "Contas" e "Mais" expandidos.
- O botão **Registrar** resolve o problema nº 1 do uso diário: lançar um gasto passa a ser 1 toque de qualquer lugar, sem rolar o mosaico. (O botão flutuante de pergunta à IA continua existindo, reposicionado para não brigar com a bottom nav.)
- A tela **Contas** dá endereço fixo a Cartões, Dívidas e Limites — Limites deixa de ser órfã.
- Toda tela interna mantém o "Voltar", mas a bottom nav elimina a navegação em estrela.

### 1.2 Mês selecionado vale para o app inteiro

O `SeletorMes` passa a propagar `?ano=&mes=` para Cartões, Dívidas, Limites, Alertas e
Orientação (hoje essas telas usam sempre o mês corrente). Quando o usuário estiver vendo um
mês passado, uma faixa discreta "Você está vendo junho/2026" evita confusão.

---

## 2. Dashboard — nova hierarquia de cards

Ordem única, seguindo a jornada financeira real. Os dois primeiros blocos são o destaque
obrigatório (saldo do mês + regra 50/30/20):

### Bloco A — topo fixo, fora do mosaico

**1. Como está seu mês** (evolução do atual "Resumo do mês", enxugado)
- Número-herói: **"Sobrou até agora: R$ X"** (verde) ou **"Faltou: R$ X"** (vermelho, com o
  tom acolhedor: "Este mês saiu mais do que entrou. Vamos ver juntos onde dá pra ajustar?").
- Logo abaixo, os três números do mês: **Entrou · Saiu · Guardado** (hoje "Receitas ·
  Despesas · Investido").
- Barra "**Quanto da renda já tem dono**" (hoje "Renda comprometida"), somando gastos +
  fatura de cartão + parcelas de dívida, com a quebra por parte quando houver.
- **Sai deste card:** a mini-grade Cartões/Dívidas/Meta (duplicava os cards do mosaico) e as
  notas de rodapé que explicavam a duplicação. O card fica com uma ideia só: o fluxo do mês.

**2. Para onde foi sua renda** (evolução do "Sugestão de alocação da renda" — promovido de 8º para 2º)
- Barras comparando **o que você gastou/guardou** × **o sugerido para você** em: Essenciais,
  Desejos (rótulo novo: **"Gastos livres"**), Reserva, Investimentos.
- A pizza estática do "ideal" sai (nunca mudava); as barras comparativas ficam, pois são o
  que informa.
- Percentuais **adaptativos** (ver §5.1) — o título das faixas mostra o percentual sugerido
  para aquele usuário, não um 50/30/20 fixo.
- Dicas + botão "Pedir sugestão da FinClara" (IA) + disclaimer permanecem aqui.

### Bloco B — mosaico, em ordem de decisão

3. **Sua prioridade agora** (atual "Orientação financeira", promovido de link para card com
   conteúdo): título da prioridade (quitar dívida cara → reserva → investir), uma frase de
   explicação e a barra da reserva de emergência. É o diferencial do produto; deixa de ser
   só um link. Passa a ser **a única voz** que fala de prioridade no dashboard — os avisos
   repetidos de "dívida cara" no gráfico de alocação e no card de dívidas viram uma linha
   que aponta para este card, eliminando a mensagem em quadruplicata.
4. **Pode guardar este mês: R$ X** (a atual seção "Pode guardar com segurança" do Resumo,
   agora card próprio): valor seguro de guardar + destino sugerido alinhado com a prioridade
   ("considere...", nunca imperativo) + botão "Guardar agora" que abre o registro já
   preenchido (ver §4.2).
5. **Metas** — card passa a mostrar **a meta principal com barra de progresso** (nome, % e
   situação), não só "3 metas cadastradas". Informação que hoje estava perdida no Resumo.
6. **Cartões** — mantém (disponível + fatura do mês + cartão mais usado); é o único card
   que já mostrava dado próprio.
7. **Dívidas** — mantém total devedor; o selo "juros altos" vira referência à prioridade
   (card 3) em vez de alerta repetido.
8. **Central de alertas** — mantém (contador), desce de posição: alerta crítico continua
   visível porque o card fica vermelho.
9. **Seu dinheiro ao longo do tempo** (atual "Evolução patrimonial", renomeado) — desce
   para o fim; some do mosaico enquanto houver menos de 2 meses de histórico (hoje ocupa a
   3ª posição vazio).
10. **Últimos registros** (atual "Lançamentos recentes") — mantém o padrão recolhível.

O card-formulário "Novo lançamento" **sai do mosaico**: registrar passa a ser o botão
central da bottom nav (mobile) / botão fixo no topo da sidebar (desktop).

---

## 3. Ordem lógica das telas internas

Padrão novo para Metas, Dívidas, Cartões e Limites: **situação primeiro, cadastro depois**.

1. Resumo da tela no topo (o que já existe em Dívidas e Cartões, estendido a Metas e Limites);
2. Lista com as informações e ações;
3. Botão "**+ Adicionar**" que abre o formulário (recolhido por padrão) — em vez do
   formulário aberto empurrando a lista para baixo da dobra no celular.

Na tela de Cartões, "Nova compra parcelada" vira botão dentro do card de cada cartão
("+ Compra neste cartão"), eliminando o formulário solto no fim da página.

---

## 4. Unificações (o mesmo dinheiro digitado uma vez só)

### 4.1 Aporte em meta = registro de "Guardado"

Hoje aportar numa meta não gera lançamento e vice-versa (pior inconsistência do app).
Proposta:

- **Guardar dinheiro numa meta cria automaticamente um lançamento** tipo INVESTIMENTO
  (meta tipo "Reserva de emergência" → categoria Reserva de emergência; demais →
  Outros investimentos), com descrição "Guardado na meta: <nome>".
- No formulário de registro, quando o tipo é "**Guardei**" (novo nome de Investimento),
  aparece um select opcional "**Para qual meta?**" — escolhendo, o valor também soma na meta.
- Excluir um dos lados desfaz o outro (exige vínculo `metaId` no lançamento — **mudança de
  schema, nova migration**; ver §8).

### 4.2 Sobra → ação

O card "Pode guardar este mês" ganha o botão "Guardar agora", que abre o registro já
preenchido (tipo Guardei, valor da sobra, meta sugerida conforme a prioridade). Fecha o ciclo
da jornada: ver a sobra → dar destino a ela em dois toques.

### 4.3 Reserva de emergência: um número só

Unificar as três definições atuais (3 meses na Orientação, "3–6" nas dicas, 6 na skill):

- **Primeiro objetivo: 3 meses** de gastos essenciais (barra da Orientação chega a 100% aqui,
  com celebração);
- **Objetivo ideal: 6 meses** (a barra ganha uma segunda marca; textos sempre falam
  "de 3 a 6 meses"). Uma constante única em `lib`, usada por Orientação, dicas e skill.

---

## 5. Lógica financeira

### 5.1 Regra 50/30/20 adaptativa

`calcularAlocacao` passa a escolher a proporção pela realidade do usuário, sem culpa:

| Situação (essenciais ÷ renda do mês) | Proporção sugerida (essenciais/livres/guardar) | Tom |
|---|---|---|
| até 50% | **50/30/20** (padrão) | "Você tem espaço pra guardar — que tal aumentar um pouco?" |
| 50% a 65% | **60/25/15** | neutro, sem alerta |
| 65% a 80% | **70/20/10** | "Seu orçamento está apertado; guardar qualquer valor já é vitória." |
| acima de 80% | **80/15/5** | "O importante agora é caber no mês. Guardar R$ 20 já conta." |
| sobra > 30% da renda | **50/30/20 com sugestão de elevar a fatia de investimento** | "Sua sobra é grande — considere investir mais que 20%." |

- A parte "guardar" continua dividida entre reserva e investimentos conforme a prioridade
  (com dívida cara ou sem reserva, tudo vai para a prioridade).
- As dicas param de dizer "acima dos 50% recomendados" para quem não tem como ficar abaixo
  de 50% — comparam sempre com a proporção sugerida *para aquele usuário*.

### 5.2 Indicador de dívidas > 30% da renda

O cálculo padrão do produto ("% comprometido com dívidas", alertar acima de 30%) ganha
exibição: dentro da barra "quanto da renda já tem dono", a parte de dívidas+cartão destaca
quando passa de 30%, com o texto acolhedor já definido na skill.

### 5.3 Compra parcelada com categoria

`FormCompraParcelada` ganha campo **Categoria** (mesmas categorias de despesa). Com isso a
parcela do mês entra nos Limites por categoria e no comparativo de alocação — hoje é
invisível para os dois.

---

## 6. Linguagem — renomeações (de → para)

### 6.1 Conceitos centrais

| Onde | Hoje | Proposto |
|---|---|---|
| Toggle do registro | Receita / Despesa / Investimento | **Entrou / Saiu / Guardei** |
| Card principal | Saldo disponível | **Sobrou até agora / Faltou** |
| Card principal | Receitas / Despesas / Investido | **Entrou / Saiu / Guardado** |
| Card principal | Renda comprometida | **Quanto da renda já tem dono** |
| Título de card | Novo lançamento | **Registrar** (botão da nav) |
| Lista | Lançamentos recentes | **Últimos registros** |
| Alocação | Sugestão de alocação da renda | **Para onde foi sua renda** |
| Alocação | Desejos | **Gastos livres** |
| Dashboard | Evolução patrimonial | **Seu dinheiro ao longo do tempo** |
| Orientação | Orientação financeira | **Sua prioridade agora** |
| Resumo | Pode guardar com segurança | **Pode guardar este mês** |

*(No código e no banco, `RECEITA`/`DESPESA`/`INVESTIMENTO` e nomes de modelos não mudam —
só os rótulos visíveis. "Lançamento" pode continuar no vocabulário técnico.)*

### 6.2 Campos de formulário

| Formulário | Hoje | Proposto |
|---|---|---|
| Meta | Valor-alvo | **Quanto você quer juntar** |
| Meta | Prazo (data-alvo) | **Até quando** |
| Meta (lista) | Registrar aporte / Aportar | **Guardar nesta meta / Guardar** |
| Dívida | Saldo devedor (valor total) | **Quanto você ainda deve** |
| Dívida | Valor da parcela mensal | **Quanto paga por mês** |
| Dívida | Taxa de juros (% ao mês) | **Juros por mês (%)** + opção "**Não sei os juros**" |
| Cartão | Limite total | **Limite do cartão** |
| Compra | Valor total / Parcelas | **Preço total / Em quantas vezes** |
| Limite | Definir limite por categoria | **Quanto quer gastar no máximo com...** |

A regra "acima de X% ao mês é dívida cara" sai do placeholder (que some ao digitar) e vira
texto de apoio fixo abaixo do campo. "Não sei os juros" grava um marcador e trata a dívida
com padrão conservador (considerada cara se for de cartão/cheque especial pela descrição,
com convite posterior: "descobriu os juros? Atualize aqui").

---

## 7. Campos: adicionar, unificar, remover

### Adicionar
| Onde | Campo | Motivo |
|---|---|---|
| Meta | **Quanto você já tem guardado** (opcional, default 0) | quem já poupou não precisa criar meta zerada + aporte avulso |
| Meta | `min` = hoje no campo "Até quando" | impede meta que nasce atrasada |
| Dívida | **Não sei os juros** (checkbox) | não travar quem mais precisa cadastrar |
| Dívida | **Parcelas restantes** (opcional) | é como o usuário pensa; permite validar o progresso |
| Compra parcelada | **Categoria** | integra limites e alocação (§5.3) |
| Registro tipo "Guardei" | **Para qual meta?** (opcional) | unificação §4.1 |

### Unificar
- Aporte em meta ⇄ registro "Guardei" (§4.1).
- Constante única da reserva de emergência (§4.3).
- `formatarMoeda` (e `formatarData`) duplicadas em 10+ componentes → `lib/formatos.ts`.
- Mensagem de "dívida cara" em um lugar só (card Prioridade).

### Remover
| Onde | Campo/elemento | Motivo |
|---|---|---|
| Cadastro | **Telefone, CEP, Endereço** | não usados em nenhuma funcionalidade; cadastro cai de 8 para 5 campos. Continuam disponíveis (opcionais) na tela Perfil. CPF e data de nascimento **ficam** (Mercado Pago + trava 18+) |
| Resumo | mini-grade Cartões/Dívidas/Meta + notas de rodapé | duplicava o mosaico (§2) |
| Alocação | pizza do "ideal" | estática, não informava |
| Dashboard | card-formulário de lançamento | substituído pelo botão Registrar |

---

## 8. Correções de UX de formulário (transversais)

1. **Campo de dinheiro brasileiro**: componente único `CampoValor` que aceita vírgula,
   formata "1.234,56" ao digitar e envia número correto (substitui `type="number"` nos 8
   formulários).
2. **Validação com mensagens claras em pt-BR** antes do submit ("Informe um valor maior que
   zero", "Escolha uma categoria"), substituindo os balões padrão do navegador.
3. **Descrição antes da categoria** no formulário de registro — a autocategorização volta a
   funcionar (a categoria aparece preenchida com selo "sugerida", editável).
4. **Modal de confirmação própria** (substitui `confirm()` nativo) com botões ≥ 44px.
5. **Estados vazios com convite**: "Crie sua primeira meta →" em vez de "Sem metas cadastradas".
6. **Onboarding de primeiro uso** (3 passos no dashboard vazio): ① registre quanto entrou
   este mês → ② registre seus gastos de hoje → ③ crie uma meta. Some ao completar.
7. Fonte mínima de 12.5px para qualquer texto informativo (hoje há notas com 11px).

**Mudanças de schema necessárias (novas migrations, nunca editar antigas):**
- `Lancamento.metaId` (opcional) — vínculo aporte⇄registro (§4.1);
- `Divida.jurosDesconhecidos` (boolean) e `Divida.parcelasRestantes` (opcional) (§6.2/§7);
- `CompraParcelada.categoria` (§5.3).

---

## 9. Ordem de implementação sugerida (Fase 3)

| Etapa | Conteúdo | Risco |
|---|---|---|
| **P0 — estrutura** | Bottom nav/sidebar + botão Registrar em bottom-sheet + tela Contas + reordenação do dashboard (blocos A/B) + mês propagado | médio (layout), sem schema |
| **P1 — linguagem** | Todas as renomeações (§6) + estados vazios + remoção das duplicações no Resumo | baixo |
| **P2 — unificações** | Aporte⇄registro (migration `metaId`) + campo valor pt-BR + validações + modal de confirmação | médio (dados) |
| **P3 — lógica financeira** | 50/30/20 adaptativo + reserva 3→6 unificada + indicador dívidas>30% + categoria na compra parcelada (migrations) + "não sei os juros" | médio (testes de cálculo) |
| **P4 — aquisição** | Cadastro enxuto (5 campos) + onboarding de 3 passos | baixo |

Cada etapa termina com `npm run build` + testes existentes verdes + teste manual em 375px e
1440px. Testes novos acompanham cada mudança de cálculo (`lib/*.test.ts`) e os fluxos críticos
de Cypress são atualizados quando a navegação mudar.

---

## 10. O que NÃO muda

- Prioridade financeira (dívida cara → reserva → investir) — só ganha mais destaque.
- Disclaimer educativo em toda sugestão de investimento (conformidade CVM) — preservado em
  todos os novos textos; linguagem sempre sugestiva ("considere", "uma opção seria").
- Enums e modelos do banco existentes (só adições via migration).
- Autocategorização, data padrão inteligente, projeção de metas, alertas por severidade,
  fluxo de assinatura/trial e relatórios (apenas herdam os novos nomes).
