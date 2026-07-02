import type { Meta } from "@prisma/client";

export const LABEL_TIPO_META: Record<string, string> = {
  RESERVA: "Reserva de emergência",
  VIAGEM: "Viagem",
  CARRO: "Carro",
  FACULDADE: "Faculdade",
  APOSENTADORIA: "Aposentadoria",
  OUTRO: "Outro",
};

export type ProjecaoMeta = {
  percentual: number;
  concluida: boolean;
  atrasada: boolean;
  dataProjetada: Date | null;
};

const DIA_MS = 1000 * 60 * 60 * 24;

// Projeta se a meta será concluída dentro do prazo, com base no ritmo médio de aportes
// desde a criação (valorAtual / dias decorridos) — não depende de um histórico de aportes.
export function calcularProjecao(
  meta: Pick<Meta, "valorAlvo" | "valorAtual" | "prazo" | "criadoEm">
): ProjecaoMeta {
  const valorAlvo = Number(meta.valorAlvo);
  const valorAtual = Number(meta.valorAtual);
  const percentual = valorAlvo > 0 ? Math.min((valorAtual / valorAlvo) * 100, 100) : 0;

  if (valorAtual >= valorAlvo && valorAlvo > 0) {
    return { percentual: 100, concluida: true, atrasada: false, dataProjetada: null };
  }

  const hoje = new Date();
  const prazo = new Date(meta.prazo);
  const diasDecorridos = (hoje.getTime() - new Date(meta.criadoEm).getTime()) / DIA_MS;

  if (diasDecorridos < 1 || valorAtual <= 0) {
    // Ainda não há aportes suficientes para estimar um ritmo
    return { percentual, concluida: false, atrasada: hoje > prazo, dataProjetada: null };
  }

  const ritmoDiario = valorAtual / diasDecorridos;
  const faltam = valorAlvo - valorAtual;
  const diasNecessarios = faltam / ritmoDiario;
  const dataProjetada = new Date(hoje.getTime() + diasNecessarios * DIA_MS);

  return { percentual, concluida: false, atrasada: dataProjetada > prazo, dataProjetada };
}

// Estratégia sugerida por horizonte de tempo (regra do FinClara, sem considerar ainda o
// perfil de investidor do usuário — isso chega numa fase futura).
export function estrategiaSugerida(prazo: Date): string {
  const meses = (new Date(prazo).getTime() - Date.now()) / (DIA_MS * 30);
  if (meses <= 12) return "Prazo curto: estratégia conservadora e com liquidez";
  if (meses <= 60) return "Prazo médio: estratégia equilibrada";
  return "Prazo longo: estratégia diversificada, conforme seu perfil";
}

export function ordenarPorPrazo(metas: Meta[]): Meta[] {
  return [...metas].sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());
}
