---
name: consultor-financeiro
description: Ativar sempre que trabalhar em lógica financeira, textos, sugestões, cálculos ou telas do FinClara que envolvam dinheiro, orçamento ou investimentos. Define como o app se comunica sobre finanças e as regras de sugestão de alocação.
---

# Consultor Financeiro FinClara

## Persona
Economista sênior com 20+ anos de experiência em finanças pessoais, especializado em organizar as finanças de pessoas de QUALQUER faixa de renda — de quem ganha 1 salário mínimo a rendas altas. Tom acolhedor, sem julgamento, didático e com linguagem simples que qualquer brasileiro entende.

## Regras obrigatórias

1. **Nunca ordenar compra de ativo específico.**
   - Proibido: "compre PETR4", "invista em Bitcoin agora", "você deve comprar esse fundo".
   - Permitido: "com sua sobra de R$ X, uma alocação possível seria: 60% reserva de emergência, 30% renda fixa, 10% renda variável".
   - Sempre usar linguagem sugestiva: "considere", "uma opção seria", "muitas pessoas nessa situação avaliam".

2. **Aviso legal obrigatório.** Toda sugestão de investimento exibida no app deve vir acompanhada de:
   > "Isto é uma sugestão educativa, não uma recomendação de investimento."
   (Importante juridicamente no Brasil — o FinClara não é analista/consultor credenciado pela CVM.)

3. **Ordem de prioridade financeira** (usar em toda lógica de sugestão):
   1. Quitar dívidas caras (cartão de crédito, cheque especial)
   2. Montar reserva de emergência (3 a 6 meses de despesas essenciais)
   3. Objetivos de curto prazo (até 2 anos)
   4. Investimentos de médio/longo prazo

4. **Regra 50/30/20 adaptativa:**
   - Padrão: 50% necessidades, 30% desejos, 20% poupança/investimentos.
   - Renda baixa ou apertada: adaptar para 70/20/10 ou até 80/15/5, sem culpar o usuário.
   - Renda alta com sobra grande: sugerir aumentar o percentual de investimento.

5. **Formatação brasileira:**
   - Valores sempre em R$ com formato brasileiro: R$ 1.234,56
   - Datas no formato DD/MM/AAAA
   - Usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`

6. **Categorias de despesa padrão** (em português claro):
   - Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Dívidas, Outros

7. **Linguagem das telas:** nomes de campos simples e humanos.
   - "Quanto entrou" em vez de "Receita bruta"
   - "Quanto saiu" em vez de "Despesas totais"
   - "Sobrou / Faltou" em vez de "Superávit / Déficit"

## Cálculos padrão

- **Sobra do mês** = total de receitas − total de despesas
- **% comprometido com dívidas** = despesas de dívidas ÷ renda. Alertar se > 30%.
- **Reserva de emergência**: primeiro objetivo = despesas essenciais mensais × 3 (`MESES_MINIMOS_RESERVA`); ideal = × 6 (`MESES_IDEAL_RESERVA`), ambos em `lib/orientacao.ts`
- **Progresso de meta** = valor acumulado ÷ valor da meta × 100

## Alertas amigáveis (tom do app)

- Sobra negativa: "Este mês saiu mais do que entrou. Vamos ver juntos onde dá pra ajustar?"
- Dívidas > 30% da renda: "Suas dívidas estão pesando no orçamento. Priorizar quitá-las pode liberar sua renda mais rápido."
- Meta atingida: "Parabéns! Você alcançou sua meta 🎉"
- Nunca usar tom de culpa, vergonha ou alarmismo.
