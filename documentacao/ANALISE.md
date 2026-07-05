# ANÁLISE — Auditoria de campos, telas e fluxo do FinClara

> Fase 1 da reorganização. Data: 03/07/2026.
> Olhar aplicado: economista de finanças pessoais (qualquer faixa de renda) + UX para leigos.
> Nenhum código foi alterado nesta fase.

---

## 1. Fluxo atual do usuário

### 1.1 Do cadastro ao primeiro uso

1. `/` redireciona para `/login` (sem conta) ou `/dashboard` (logado). **Não há landing page** — quem chega sem contexto cai direto num formulário de login.
2. **Cadastro** (`/login`, modo "cadastro"): Nome, CPF, Data de nascimento, E-mail, Senha, Telefone, CEP, Endereço → confirmação por e-mail → volta e faz login.
3. **2FA opcional** no login (código TOTP), se ativado.
4. Cai no **dashboard vazio**: não existe onboarding. O usuário vê "R$ 0,00", nove cards e precisa descobrir sozinho que o primeiro passo é lançar a renda do mês.

### 1.2 Uso diário (registrar um gasto — a ação mais frequente)

Dashboard → **rolar o mosaico até quase o fim** (o form "Novo lançamento" é o 8º card) → escolher tipo → categoria → descrição → valor → data → salvar. No celular (uso principal declarado), são muitas rolagens para a ação nº 1 do produto.

### 1.3 Navegação entre telas

- **Não existe bottom nav (mobile) nem sidebar (desktop)** — o CLAUDE.md exige isso e não está implementado. A navegação é: cards clicáveis do dashboard + menu hambúrguer (Perfil, Perfil de investidor, Relatórios, Segurança, Configurações, Ajuda, Sair) + botão "Voltar" em cada tela interna.
- Toda tela interna só sabe voltar para `/dashboard` (navegação em estrela; não dá para ir de Metas a Dívidas sem passar pela home).
- **Limites por categoria é uma tela órfã**: só é alcançável pela Central de alertas (link no rodapé da tela de alertas) ou clicando num alerta de limite. Quem nunca teve alerta talvez nunca descubra que o recurso existe.
- **Perfil de investidor** (insumo-chave das sugestões) está escondido no menu hambúrguer; a orientação apenas menciona em texto "responda o questionário no menu".

### 1.4 Inconsistência de mês entre telas

O dashboard tem `SeletorMes` (?ano=&mes=), mas **Cartões, Dívidas, Limites, Alertas e Orientação usam sempre o mês corrente** (`new Date()`). Usuário olhando junho na home clica em "Cartões" e vê a fatura de julho, sem nenhum aviso.

---

## 2. Mapa de telas

| Rota | Conteúdo | Como se chega |
|---|---|---|
| `/login` | Login/cadastro/2FA | redirect da raiz |
| `/dashboard` | Resumo + mosaico de 9 cards | pós-login |
| `/dashboard/metas` | FormMeta + ListaMetas (com aporte) | card Metas |
| `/dashboard/dividas` | Resumo de dívidas + FormDivida + ListaDividas | card Dívidas |
| `/dashboard/cartoes` | Resumo + FormCartao + ListaCartoes + FormCompraParcelada | card Cartões |
| `/dashboard/limites` | FormLimiteCategoria + ListaLimites | **só via Central de alertas** |
| `/dashboard/alertas` | Lista de alertas + link para Limites | card Central de alertas |
| `/dashboard/orientacao` | Prioridade financeira + barra de reserva | card Orientação |
| `/dashboard/perfil-investidor` | Perfil atual + questionário (3 perguntas) | menu hambúrguer |
| `/dashboard/relatorios` | 5 relatórios (PDF/CSV), 4 com selo Pro | menu hambúrguer |
| `/dashboard/perfil` | AssinaturaCard + dados cadastrais | menu hambúrguer |
| `/dashboard/seguranca`, `/configuracoes`, `/ajuda`, `/assinatura`, `/termos` | conta/suporte | menu / links |

### Ordem atual do mosaico do dashboard

1. **Resumo do mês** (fora do mosaico, topo — correto)
2. Orientação financeira (link)
3. Gráfico de evolução patrimonial
4. Central de alertas (link)
5. Metas (link)
6. Cartões (mini-resumo + link)
7. Dívidas (link)
8. **Sugestão de alocação da renda (50/30/20)** ← enterrado
9. **Novo lançamento (form)** ← enterrado
10. Lançamentos recentes (recolhível)

---

## 3. Inventário de campos por formulário

### 3.1 Cadastro (`/login`)

| Campo | Obrigatório | Função | Problemas |
|---|---|---|---|
| Nome | sim | saudação, cadastro | ok |
| CPF | sim | identidade única + Mercado Pago | validado (dígito verificador), boa máscara |
| Data de nascimento | sim | trava de 18+ | ok |
| E-mail / Senha | sim | auth | "Mínimo 6 caracteres" só no placeholder |
| Telefone | não | não usado em nenhuma funcionalidade | **fricção sem retorno** |
| CEP + Endereço | não | não usados em nenhuma funcionalidade | **fricção sem retorno**; ViaCEP é um toque legal, mas o dado não serve para nada hoje |

**Problema central:** 8 campos antes de ver qualquer valor do produto. Para um app que promete simplicidade, o cadastro parece abertura de conta em banco. Telefone/CEP/endereço poderiam ser coletados depois (ou nunca).

### 3.2 Novo lançamento (`FormLancamento` — coração do app)

| Campo | Tipo | Problemas |
|---|---|---|
| Tipo (Receita/Despesa/Investimento) | toggle | "Receita/Despesa" é jargão contábil — o guia do produto pede "Quanto entrou / Quanto saiu". "Investimento" como 3º tipo confunde: guardar dinheiro não é "saída"? (é, mas o app trata separado e explica só em letra miúda no Resumo) |
| Categoria | select | **Vem ANTES da descrição, mas a sugestão automática de categoria é disparada pela descrição.** Na ordem atual o usuário escolhe categoria manualmente e mata o recurso de autocategorização (`categoriaEscolhidaManualmente` bloqueia a sugestão) |
| Descrição | texto | ok, bom placeholder |
| Valor | `type="number"` | Placeholder "0,00" com vírgula, mas o input só aceita ponto — **brasileiro digita vírgula e o campo rejeita/ignora**. Sem máscara de moeda. Erro de validação é o do navegador, não a mensagem clara em pt-BR prometida |
| Data | date | default inteligente (acompanha o mês selecionado) — bom |
| Repetir todo mês | checkbox | bom, com tooltip |

### 3.3 Nova meta (`FormMeta`)

| Campo | Problemas |
|---|---|
| Tipo (Reserva de emergência, Viagem, Carro, Faculdade, Aposentadoria, Outro) | ok, mas nada explica que o tipo "Reserva de emergência" é o que alimenta a Orientação financeira — escolha silenciosamente importante |
| Descrição | ok |
| **Valor-alvo** | jargão. "Quanto você quer juntar" é mais claro |
| **Prazo (data-alvo)** | jargão duplicado ("prazo" + "data-alvo"). Sem `min` — **aceita prazo no passado**, criando meta que nasce "atrasada" |
| (faltando) Valor inicial | quem já tem dinheiro guardado precisa criar a meta e depois fazer um "aporte" avulso |

### 3.4 Aporte em meta (`ListaMetas`)

- "**Registrar aporte**" / botão "**Aportar**" — jargão de investidor. "Guardar dinheiro" / "Adicionar" é a linguagem do público.
- **Problema estrutural grave:** aportar numa meta **não gera lançamento** (`aportarMeta` só incrementa `valorAtual`), e um lançamento tipo INVESTIMENTO categoria "Reserva de emergência" **não atualiza a meta**. O mesmo dinheiro precisa ser digitado **duas vezes** para aparecer certo no Resumo (via lançamento) E na meta/Orientação (via aporte). Quem digita só uma vez fica com dashboard inconsistente: reserva "zerada" na Orientação, ou "Investido" zerado no Resumo.

### 3.5 Nova dívida (`FormDivida`)

| Campo | Problemas |
|---|---|
| Descrição | ok |
| **Saldo devedor (valor total)** | jargão bancário. "Quanto você ainda deve" |
| Valor da parcela mensal | ok |
| **Taxa de juros (% ao mês)** — obrigatório | Muitos brasileiros endividados **não sabem a taxa da própria dívida** — e o campo é obrigatório, podendo travar exatamente o usuário que mais precisa cadastrar a dívida. Falta opção "não sei" (com padrão conservador) e ajuda de onde achar a taxa. A regra "acima de X% é cara" está no placeholder, que some ao digitar |
| Próximo vencimento | ok |
| (faltando) Nº de parcelas restantes | o app deduz o progresso pelo saldo ÷ parcela, funciona, mas o usuário pensa em "faltam 14 parcelas" |

### 3.6 Novo cartão (`FormCartao`) e compra parcelada (`FormCompraParcelada`)

- Campos adequados (apelido, limite, dia de fechamento/vencimento; cartão, descrição, valor total, parcelas, data).
- Problema de ordem na página: FormCartao → ListaCartoes → FormCompraParcelada. O form de compra fica **depois** da lista, no fim da página; e a compra parcelada não tem categoria (não entra nos limites por categoria nem no 50/30/20).

### 3.7 Limite por categoria (`FormLimiteCategoria`)

- Campos ok (categoria de despesa + limite mensal). O problema é a tela ser inalcançável (ver 1.3).

### 3.8 Questionário de perfil (3 perguntas) e dados cadastrais

- Adequados. Dados cadastrais com CPF imutável após definido — boa decisão.

---

## 4. Cards do dashboard — função e problemas

| Card | Função | Problemas |
|---|---|---|
| **Resumo do mês** | Saldo disponível, receitas/despesas/investido, barra de renda comprometida, mini-visão cartões/dívidas/meta, "pode guardar com segurança", botão de sugestão IA | É o card certo no lugar certo, mas **acumulou 6 seções** e virou um dashboard dentro do dashboard. "Saldo disponível... ainda sem destino" + nota "cartões e dívidas não são descontados do saldo acima" = o próprio card precisa de duas notas de rodapé para se explicar. Termos: "Receitas/Despesas" em vez de "Entrou/Saiu"; "Renda comprometida" sem explicação |
| **Orientação financeira** | Link com a prioridade (quitar dívida → reserva → investir) | Bom conceito (é o diferencial do produto), mas é só um link discreto. **Redundante** com: destino da sobra no Resumo, alerta de dívida cara no GraficoAlocacao, aviso na tela Dívidas — a mesma mensagem "quite a dívida cara" pode aparecer 4× na mesma tela |
| **Evolução patrimonial** | Gráfico metas − dívidas mês a mês | "Patrimonial" é palavra pesada para leigo; para usuário novo o gráfico fica vazio meses e ocupa posição nobre (3º card) |
| **Central de alertas** | Contador de alertas | ok |
| **Metas** | "N metas cadastradas" + atrasadas | Só contagem — **não mostra a meta nem o progresso** (a informação útil está no Resumo, duplicada) |
| **Cartões** | disponível + fatura do mês + cartão mais usado | Útil, porém **duplica** os números que o Resumo já mostra |
| **Dívidas** | total devedor + aviso de dívida cara | Idem — duplicado no Resumo |
| **Sugestão de alocação (50/30/20)** | Pizza ideal + barras atual × ideal + dicas + disclaimer | **Deveria estar em destaque no topo (regra do CLAUDE.md) e está em 8º.** Rótulos fixos "Essenciais (50%)" mesmo sendo o único lugar onde a regra aparece; **a regra não é adaptativa** (ver §5.1). A pizza mostra o *ideal* (sempre as mesmas proporções) — um gráfico que nunca muda tem pouco valor; o comparativo de barras é o que informa |
| **Novo lançamento** | Form | Ação mais frequente em 9º lugar no mosaico |
| **Lançamentos recentes** | Lista recolhível | ok, bom padrão |

---

## 5. Problemas transversais (resumo priorizado)

### 5.1 Lógica financeira

1. **Regra 50/30/20 não é adaptativa.** `lib/financas.ts` fixa 50/30/10/10 para todo mundo. A diretriz do produto manda adaptar (70/20/10 ou 80/15/5 para renda apertada; mais investimento para sobra grande). Hoje, para quem ganha 1 salário mínimo, o app diz que gastar 65% com essenciais está "errado" — tom de culpa que o produto proíbe.
2. **Dupla digitação reserva/meta** (§3.4): aporte em meta e lançamento de investimento são mundos separados. Pior inconsistência de dados do app.
3. Reserva de emergência: Orientação usa alvo de **3 meses** (`MESES_MINIMOS_RESERVA = 3`), dicas do GraficoAlocacao falam "3–6 meses", e a skill do produto define "ideal = 6 meses". Três números para o mesmo conceito.
4. Compra parcelada no cartão não tem categoria → invisível para limites por categoria e para o 50/30/20 (o comprometimento aparece só na barra de renda comprometida).
5. "% comprometido com dívidas > 30% da renda" (cálculo padrão do produto) não tem indicador próprio — existe só a barra geral de renda comprometida (70%/100%).

### 5.2 Linguagem (para o público "qualquer renda")

| Onde está | Termo atual | Direção sugerida (guia do produto) |
|---|---|---|
| Toggle do lançamento | Receita / Despesa | Entrou / Saiu (ou "Quanto entrou / Quanto saiu") |
| Resumo | Saldo disponível | Sobrou / Faltou |
| Resumo | Renda comprometida | "Quanto da sua renda já tem dono" (ou similar + explicação) |
| Metas | Valor-alvo, prazo (data-alvo), aporte, aportar | Quanto quer juntar, até quando, guardar dinheiro |
| Dívidas | Saldo devedor, taxa de juros % a.m. | Quanto ainda deve, juros por mês (com "não sei") |
| Dashboard | Evolução patrimonial | "Seu dinheiro ao longo do tempo" |
| Dashboard | Sugestão de alocação da renda | "Para onde vai sua renda" |
| Geral | Lançamento | aceitável (comum em apps BR), mas avaliar "registro/movimentação" |

### 5.3 Estrutura e hierarquia

1. Sem bottom nav/sidebar (violação direta do CLAUDE.md); navegação em estrela; Limites órfã.
2. 50/30/20 fora do destaque obrigatório do topo.
3. Form de lançamento longe do alcance do polegar; sem botão flutuante "+".
4. Cards de Metas/Cartões/Dívidas duplicam o Resumo — mosaico com ~40% de informação repetida.
5. Nas telas internas, formulário sempre antes da lista/situação (para usuário recorrente, a situação importa mais que o cadastro).
6. Telas internas ignoram o mês selecionado no dashboard (§1.4).

### 5.4 UX de formulário e feedback

1. Inputs de dinheiro sem máscara pt-BR (vírgula não funciona).
2. Validações dependem do navegador; as mensagens claras em português prometidas só existem nos erros de servidor.
3. `confirm()` nativo do navegador para toda exclusão — visual quebrado e ruim no touch.
4. Categoria antes da descrição anula a autocategorização (§3.2).
5. Meta aceita prazo no passado.
6. Fontes de 11–11.5px em informações relevantes (notas do Resumo) — legibilidade fraca para o público-alvo em tela pequena.

### 5.5 Onboarding e primeiro valor

1. Cadastro pede 8 campos, incluindo 3 sem uso no produto (telefone, CEP, endereço).
2. Zero onboarding pós-cadastro; dashboard vazio não guia ("comece registrando quanto você ganha").
3. Estados vazios dos cards são passivos ("Sem metas cadastradas") em vez de convites ("Crie sua primeira meta →").

### 5.6 Código (impacta a manutenção da reorganização)

- `formatarMoeda` duplicada em 10+ arquivos — deveria viver em `lib` (regra do projeto: lógica financeira fora da UI).
- Estilos inline extensos em quase todos os componentes, dificultando consistência (o projeto declara Tailwind, mas usa CSS próprio + inline styles).

---

## 6. Pontos fortes (a preservar)

- Prioridade financeira correta e consistente na lógica: dívida cara → reserva → investir.
- Disclaimer educativo presente em toda sugestão de investimento (conformidade CVM ok nas telas auditadas).
- Tom acolhedor, sem culpa, nos textos existentes.
- Autocategorização por descrição, data padrão inteligente, dívidas quitadas fora dos cálculos, projeção de metas por ritmo real, alertas ordenados por severidade — boas decisões de produto.
- Acessibilidade básica razoável: labels em todos os inputs, `role`/`aria` nos lugares certos.
