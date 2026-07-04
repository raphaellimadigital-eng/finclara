# AUDITORIA_PAGINAS — Alinhamento e espaçamento das páginas internas

> Levantamento de Relatórios, Perfil, Segurança, Configurações e Ajuda e Suporte antes de
> qualquer alteração de código (FASE 1). Nenhuma mudança foi feita ainda.

---

## 1. Relatórios (`app/dashboard/relatorios/page.tsx`)

- **Container:** `container-largo` (max-width 980px a partir de 900px)
- **Título:** `<h1>` com ícone + texto, `fontSize: 20`, `marginBottom: 16` — padrão
- **Estrutura de cards:** `<GridMosaico>` envolvendo **5 cards**, todos `<div className="card">` puro (nenhum estilo próprio de padding/radius/bg)
- **Padding/radius/bg:** herdado 100% da classe `.card` global (20px / 14px / `--card-bg`) — **sem inconsistência aqui**
- **Gap:** o de `GridMosaico` (`GAP_MOSAICO = 16px`, mesmo valor usado no dashboard antes da migração)
- **Observação:** é masonry (JS, mesmo algoritmo que o dashboard usava antes de virar CSS Grid) — sofre do mesmo problema de alinhamento de topo entre colunas que você pediu para corrigir no dashboard

## 2. Perfil (`app/dashboard/perfil/page.tsx`)

- **Container:** `container-largo`
- **Título:** `<h1>` ícone + texto, `fontSize: 20`, `marginBottom: 16` — padrão, idêntico a Relatórios
- **Estrutura de cards:** `<GridMosaico>` envolvendo **2 cards**: `AssinaturaCard` e `FormDadosCadastrais`, ambos `<div className="card">`
- **Padding/radial/bg:** herdado da classe `.card` — sem inconsistência
- **Gap:** mesmo `GAP_MOSAICO` do GridMosaico
- **Observação:** com só 2 cards, o desalinhamento de masonry é menos visível, mas o mecanismo é o mesmo do item 1

## 3. Segurança (`app/dashboard/seguranca/page.tsx`)

- **Container:** `container-largo`
- **Título:** `<h1>` ícone + texto, `fontSize: 20`, `marginBottom: 16` — padrão
- **Estrutura de cards:** `<GridMosaico>` envolvendo **3 cards**: `TrocarSenha`, `ConfiguracaoDoisFatores`, `ExportarExcluirDados`, todos `<div className="card">`
- **Padding/radius/bg:** herdado da classe `.card` — sem inconsistência
- **Gap:** mesmo `GAP_MOSAICO`
- **Observação:** `ConfiguracaoDoisFatores` busca dados assincronamente (muda de altura depois da primeira renderização) — é justamente o caso mencionado no comentário do `GridMosaico` que motivou o `ResizeObserver`; ao migrar para CSS Grid isso deixa de ser um problema (a altura de linha é natural, não medida)

## 4. Configurações (`app/dashboard/configuracoes/page.tsx`)

- **Container:** **`container`** (max-width 520px) — **diferente das outras 4 páginas**, que usam `container-largo` (980px). É a maior inconsistência visual encontrada: esta página fica visivelmente mais estreita no desktop.
- **Título:** `<h1>` ícone + texto, `fontSize: 20`, `marginBottom: 16` — padrão, igual às demais
- **Estrutura de cards:** **nenhum grid** — só **1 card** solto (`<div className="card" style={{ display: "flex", ... }}>` com o toggle de tema), sem `GridMosaico` nem qualquer wrapper
- **Padding/radius/bg:** herdado da classe `.card` — sem inconsistência na aparência do card em si
- **Observação:** é a página mais "vazia" hoje (só Aparência) — a ausência de grid não chama atenção com 1 item só, mas se crescer (ex: você adicionar mais preferências), vai precisar do mesmo grid das outras

## 5. Ajuda e Suporte (`app/dashboard/ajuda/page.tsx`)

- **Container:** `container-largo`
- **Título:** `<h1>` ícone + texto, `fontSize: 20`, `marginBottom: 16` — padrão
- **Estrutura de cards:** `<GridMosaico>` envolvendo **4 itens**: `PerguntaIA`, card de FAQ, link estilizado como card (WhatsApp), `FormContatoSuporte` — todos usam `className="card"` (o link do WhatsApp usa `<a className="card">`, mesmo padrão do `CardCartoes`/`CardDividas` do dashboard)
- **Padding/radius/bg:** herdado da classe `.card` — sem inconsistência
- **Gap:** mesmo `GAP_MOSAICO`
- **Observação:** **o parágrafo final** ("Veja também nossos Termos de Uso...") fica **fora do grid e fora de qualquer card** — flutua direto sobre o fundo da página, sem padding/borda. É a única página com conteúdo "solto" fora do padrão cartão-ou-grid.

---

## Resumo das inconsistências encontradas

| Item | Relatórios | Perfil | Segurança | Configurações | Ajuda |
|---|---|---|---|---|---|
| Container | `container-largo` | `container-largo` | `container-largo` | **`container` (520px)** ⚠️ | `container-largo` |
| Usa grid de cards | Sim (GridMosaico) | Sim (GridMosaico) | Sim (GridMosaico) | **Não** ⚠️ | Sim (GridMosaico) |
| Todos os cards usam `.card` | Sim | Sim | Sim | Sim | Sim |
| Conteúdo fora de card/grid | Não | Não | Não | N/A | **Sim** (parágrafo de Termos) ⚠️ |
| Padrão de título (`h1`) | ✅ idêntico | ✅ idêntico | ✅ idêntico | ✅ idêntico | ✅ idêntico |
| Padrão do botão "Voltar" | ✅ idêntico | ✅ idêntico | ✅ idêntico | ✅ idêntico | ✅ idêntico |

**Achados principais:**

1. **Título e botão "Voltar" já são idênticos em todas as 5 páginas** — nada a mudar aqui.
2. **Todos os cards de todas as páginas já usam a mesma classe `.card`** (mesmo padding 20px, `border-radius` 14px, cor de fundo/borda) — não há estilização própria divergente em nenhum componente auditado.
3. **A única divergência de largura de container é `Configurações`**, que usa `container` (520px) em vez de `container-largo` (980px) como as outras 4.
4. **4 das 5 páginas usam `GridMosaico`** (o mesmo algoritmo de masonry em JS que o dashboard usava antes da migração para CSS Grid feita há pouco) — sofrem do mesmo problema de alinhamento de topo entre colunas. `Configurações` não usa grid nenhum porque só tem 1 card hoje.
5. **Ajuda e Suporte tem um trecho de conteúdo (o link de Termos) fora do padrão card/grid**, flutuando solto no fundo da página.

## Proposta para FASE 2 (aguardando sua aprovação)

- Trocar `container` por `container-largo` em Configurações, igualando a largura às outras 4.
- Substituir `<GridMosaico>` pelo mesmo `.dashboard-grid` (CSS Grid, 2 colunas ≥900px, gap 16px único) já implementado no dashboard, nas 4 páginas que usam masonry — incluindo Configurações, mesmo com 1 card só, para já nascer pronta a receber mais itens.
- Envolver o parágrafo de Termos (Ajuda) em um `<div className="card">` (ou um wrapper `dashboard-grid-full` dentro do grid), para não ficar mais solto fora do padrão.
- Título e botão "Voltar" não precisam de nenhuma mudança — já estão idênticos.

Aguardando sua aprovação para seguir para a FASE 2.
