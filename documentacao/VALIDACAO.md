# VALIDAÇÃO — Auditoria de campos de formulário do FinClara

> Levantamento de todo campo de input do app antes de qualquer alteração de código. Nenhuma
> mudança foi feita ainda — este documento existe para revisão dos limites propostos.

Legenda de "Problema encontrado": 🔴 crítico (permite dado inválido/quebrado) · 🟡 moderado
(inconsistente com outros campos ou sem mensagem clara) · 🟢 nenhum (já adequado).

---

## 1. Cadastro / Login (`app/login/page.tsx`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Nome | texto livre | sem mín, sem máx | `required` (HTML) | 🔴 Sem `maxLength`; aceita 1 caractere ou só espaços (`"   "` passa no `required` do navegador) |
| CPF | texto c/ máscara `000.000.000-00` | 14 (com máscara) | `formatarCpf` + `cpfValido()` (dígito verificador) client-side; `cpfDisponivel()` (unicidade) antes do submit | 🟢 Já robusto |
| Data de nascimento | date | — | `maiorDeIdade()` (18+) client-side | 🟢 Já robusto |
| E-mail | `type="email"` | sem `maxLength` | validação nativa do navegador (formato) | 🟡 Sem validação server-side própria (delegada ao Supabase Auth) — aceitável, mas não documentado |
| Senha | `type="password"` | `minLength={6}`, sem máx | HTML `minLength` | 🟡 Sem máximo (senhas absurdamente longas não são bloqueadas) nem indicação de força |

## 2. Registro de Entrou/Saiu/Guardei (`components/FormLancamento.tsx` + `app/dashboard/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Tipo (Entrou/Saiu/Guardei) | enum fixo (toggle) | — | fixo, não digitável | 🟢 N/A |
| Descrição ("O que foi?") | texto livre | `maxLength={100}` client; **sem limite no server** | `required` client; server só checa `!descricao` (string vazia) | 🔴 Server aceita string de qualquer tamanho e só de espaços (`"   "` é truthy); sem `trim()` |
| Categoria | select, enum fixo | — | `required` | 🟢 N/A |
| Meta vinculada (opcional) | select, enum fixo | — | opcional | 🟢 N/A |
| Valor | `CampoValor` (texto mascarado pt-BR) | > 0 e ≤ R$ 1.000.000,00 (`VALOR_MONETARIO_MAXIMO`) | client: `setCustomValidity` com mensagens em pt-BR; server: `valorMonetarioValido()` | 🟢 Já robusto — é o padrão a replicar nos demais campos de texto |
| Data | `type="date"` | sem `min`/`max` | `required` | 🟡 Aceita qualquer data passada/futura sem limite — pode gerar lançamento em 1900 ou 2999 |
| Recorrente | checkbox | — | — | 🟢 N/A |

## 3. Metas (`components/FormMeta.tsx` + `app/dashboard/metas/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Tipo | select, enum fixo | — | `required` | 🟢 N/A |
| Descrição | texto livre | `maxLength={100}` client; sem limite server | server só checa `!descricao` | 🔴 Mesmo problema do lançamento: sem mínimo, sem trim, aceita só espaços |
| Quanto você quer juntar (valorAlvo) | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server (`valorMonetarioValido`) | 🟢 Já robusto |
| Até quando (prazo) | `type="date"` | `min` = hoje | `required` | 🟢 Já robusto (impede meta atrasada de nascença) |
| **Aporte avulso** (`components/ListaMetas.tsx`, campo `valorAporte`) | `type="text" inputMode="decimal"` — **não usa `CampoValor`** | sem teto client-side | regex manual `[^\d.,]` no `onChange`; validação de teto só no server (`aportarMeta`) | 🔴 Único campo monetário do app que não usa o componente `CampoValor` — sem `setCustomValidity`, sem mensagem de erro amigável antes do submit, sem checagem de "maior que zero" no client |

## 4. Dívidas (`components/FormDivida.tsx` + `app/dashboard/dividas/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Descrição | texto livre | `maxLength={100}` client; sem limite server | server só checa `!descricao` | 🔴 Mesmo padrão dos outros: sem mínimo, sem trim |
| Quanto você ainda deve (valorTotal) | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server | 🟢 Já robusto |
| Quanto paga por mês (valorParcela) | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server | 🟡 Não valida que `valorParcela ≤ valorTotal` (parcela pode ser maior que a dívida toda) |
| Juros por mês (%) | `CampoValor` | > 0 e ≤ 100 (`TAXA_JUROS_MAXIMA`), obrigatório só se "Não sei os juros" desmarcado | client + server | 🟢 Já robusto |
| Não sei os juros | checkbox | — | — | 🟢 N/A |
| Parcelas restantes (opcional) | `type="number"` | `min={0}`, **sem `max`** | server: `isNaN || < 0` | 🟡 Sem teto — aceita 999999 parcelas sem aviso |
| Próximo vencimento | `type="date"` | **sem `min`** | `required` | 🔴 Aceita data de vencimento no passado — o pedido original já citava esse exemplo específico |

## 5. Cartões (`components/FormCartao.tsx` + `app/dashboard/cartoes/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Apelido do cartão | texto livre | `maxLength={50}` client; sem limite server | server só checa `!nome` | 🔴 Sem mínimo, sem trim |
| Limite do cartão | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server | 🟢 Já robusto |
| Dia de fechamento | `type="number"` | `min="1" max="31"` | server: `isNaN \|\| <1 \|\| >31` | 🟢 Já robusto (mas não valida fechamento ≠ vencimento) |
| Dia de vencimento | `type="number"` | `min="1" max="31"` | server: `isNaN \|\| <1 \|\| >31` | 🟢 Já robusto |

## 6. Compra parcelada (`components/FormCompraParcelada.tsx` + `app/dashboard/cartoes/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Cartão | select, enum dinâmico (cartões do usuário) | — | `required` (quando não é fixo) | 🟢 N/A |
| O que comprou? | texto livre | `maxLength={100}` client; sem limite server | server só checa `!descricao` | 🔴 Sem mínimo, sem trim |
| Preço total | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server | 🟢 Já robusto |
| Em quantas vezes | `type="number"` | `min="1" max="60"` | server: `isNaN \|\| <1 \|\| >60` | 🟢 Já robusto |
| Data da compra | `type="date"` | sem `min`/`max`, default hoje | `required` | 🟡 Aceita data futura ou muito antiga sem aviso |
| Categoria | select, enum fixo | — | `required` | 🟢 N/A |

## 7. Limite por categoria (`components/FormLimiteCategoria.tsx` + `app/dashboard/limites/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Categoria | select, enum fixo | — | `required` | 🟢 N/A |
| Limite mensal | `CampoValor` | > 0 e ≤ R$ 1.000.000,00 | client + server | 🟢 Já robusto |

## 8. Dados cadastrais / Perfil (`components/FormDadosCadastrais.tsx` + `app/dashboard/perfil/actions.ts`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Nome | texto livre | sem `maxLength` | server só checa `!nome` | 🔴 Sem mínimo, sem máximo, sem trim |
| Telefone | `type="tel"` | sem `maxLength`, sem máscara | nenhuma | 🔴 Aceita qualquer texto (letras inclusive, já que `type="tel"` não restringe caracteres) |
| CEP | texto | `maxLength={9}` (já mascarado) | `formatarCep` + busca ViaCEP | 🟢 Já robusto |
| Endereço | texto livre | sem `maxLength` | nenhuma | 🟡 Sem limite — preenchido em geral pela busca de CEP, mas editável livremente |
| CPF (só se ainda não definido) | texto c/ máscara | 14 | `cpfValido()` | 🟢 Já robusto |
| Data de nascimento (só se ainda não definida) | date | — | `maiorDeIdade()` | 🟢 Já robusto |

## 9. Contato/Suporte (`components/FormContatoSuporte.tsx`)

| Campo | Tipo aceito | Tamanho mín/máx | Validação atual | Problema encontrado |
|---|---|---|---|---|
| Mensagem | textarea | `maxLength={1000}` (`LIMITE_CARACTERES_MENSAGEM`) | `required`; contador de caracteres já visível (`{mensagem.length}/{limite}`) | 🟢 Já é o padrão a replicar — é o único campo de texto do app com contador de caracteres |

---

## Resumo dos padrões encontrados

1. **Nenhum campo monetário usa `type="number"` nativo** (bom — já migrado para `CampoValor` na
   fase anterior), **exceto o aporte avulso em `ListaMetas.tsx`**, que usa um input de texto
   controlado manualmente em vez do componente compartilhado. É a maior inconsistência entre os
   campos de valor.
2. **Todo campo de texto obrigatório (`descricao`, `nome`) só é validado como `!campo` no
   server** — nenhum tem `trim()`, mínimo de caracteres, ou bloqueio de string só com espaços.
   O `maxLength` client-side existe (100 ou 50, variando por campo) mas **não é replicado no
   server** em nenhum dos casos — hoje só as APIs confiam no HTML do formulário.
3. **Nenhuma data tem `max`**, e só duas têm `min` (prazo de meta = hoje; nenhuma outra). O
   vencimento de dívida — citado no seu pedido como exemplo — hoje aceita datas passadas.
4. **Não existe biblioteca de validação (Zod, Yup, etc.) no projeto.** `package.json` não lista
   `zod` nem `react-hook-form` — toda validação hoje é manual (`if` + `throw new Error(...)`
   no server, `setCustomValidity`/atributos HTML no client). Se formos padronizar com Zod,
   será uma dependência nova.
5. **Categoria "personalizada"**: o app não tem hoje nenhum campo de categoria de texto livre —
   todas as categorias (receita, despesa, investimento, limite, compra parcelada) são `<select>`
   com enum fixo do Prisma. O item do seu pedido sobre "nome de categoria até 30 caracteres" não
   se aplica a nenhum campo existente, a menos que exista planos de permitir categorias
   personalizadas (não vi essa feature no código).

## Limites propostos para aprovação

| Tipo de campo | Proposta |
|---|---|
| Descrição de lançamento/meta/dívida/compra | `min 2` (trim) · `max 100` (já é o valor client atual — replicar no server) |
| Nome do cartão | `min 2` (trim) · `max 50` (já é o valor client atual — replicar no server) |
| Nome do usuário (cadastro/perfil) | `min 2` (trim) · `max 80` (novo — hoje sem limite) |
| Telefone | `max 20` + regex de dígitos/símbolos de telefone (bloquear letras) |
| Endereço | `max 200` (novo — hoje sem limite) |
| Valores monetários | manter `VALOR_MONETARIO_MAXIMO = R$ 1.000.000,00` já usado — **note que isso é menor que o R$ 999.999.999,99 sugerido**; manter o teto atual de produto (1 milhão) é intencional (ver comentário em `lib/valores.ts`: valor individual acima de R$ 1 milhão quase sempre é erro de digitação num app de finanças pessoais). Confirmar se quer subir o teto ou manter. |
| Vencimento de dívida | `min = hoje` (bloquear datas passadas) |
| Data da compra parcelada | `max = hoje` (bloquear compra "no futuro") |
| Data do lançamento | manter livre (usuário pode registrar lançamento retroativo de meses anteriores — isso é uso legítimo do app) |
| Parcelas restantes | `max = numParcelas` da própria dívida, ou um teto fixo (ex: 600 = 50 anos) |

Aguardando sua confirmação sobre:
1. Manter o teto de R$ 1.000.000,00 por valor (padrão atual) ou subir para R$ 999.999.999,99
   como no pedido original?
2. Confirmar o mínimo de nome (2 caracteres) não vai barrar nomes reais curtos (ex: "Jô", "Al").
3. Se o aporte avulso de meta deve migrar para o componente `CampoValor` (unificação) ou manter
   o campo próprio.
