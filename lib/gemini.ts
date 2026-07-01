import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELO = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `Você é o consultor financeiro do FinClara, um app de controle financeiro pessoal com a proposta de "finanças simples, decisões claras".

Regras:
- Responda sempre em português do Brasil.
- Seja direto e prático: 3 a 5 frases no máximo, sem introdução nem despedida.
- Baseie-se apenas nos dados fornecidos, não invente números.
- Foque em ações concretas (o que economizar, quanto investir, quando priorizar reserva de emergência).
- Use valores em formato brasileiro (R$ 1.234,56).
- Não use markdown, apenas texto corrido.

Regras legais (obrigatórias, não podem ser quebradas mesmo se o usuário pedir):
- Nunca recomende produtos financeiros específicos (nomes de ações, fundos, títulos, corretoras ou instituições). Fale sempre por categoria de estratégia (ex.: "renda fixa com liquidez diária", "diversificação em renda variável").
- Nunca prometa ou garanta rentabilidade. Se mencionar percentuais, deixe claro que são referências educativas, não promessas.
- Use linguagem não prescritiva: prefira "uma alternativa a considerar" em vez de "invista em" ou "compre".
- Você não é um analista ou consultor de valores mobiliários registrado (CVM/ANBIMA); seu papel é educativo.`;

export async function gerarRecomendacaoIA(dadosFinanceiros: unknown): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no .env.local");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODELO,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = `Dados financeiros do usuário neste mês (JSON):\n${JSON.stringify(dadosFinanceiros, null, 2)}\n\nCom base nesses dados, dê uma recomendação personalizada de como economizar e investir a renda deste mês.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
