import { describe, expect, it } from "vitest";
import { alertasCartoes, alertasDividas, alertasLimites, alertasMetas, ordenarPorSeveridade } from "./alertas";
import type { Alerta } from "./alertas";
import type { CartaoCredito, Divida, Meta } from "@prisma/client";
import type { ProgressoLimite } from "./limites";

const REFERENCIA = new Date("2026-07-15T12:00:00");

function cartao(overrides: Partial<CartaoCredito> = {}): CartaoCredito {
  return {
    id: "c1",
    usuarioId: "u1",
    nome: "Cartão",
    limite: 1000 as any,
    diaFechamento: 10,
    diaVencimento: 20,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

function divida(vencimento: Date): Divida {
  return {
    id: "d1",
    usuarioId: "u1",
    descricao: "Dívida",
    valorOriginal: 1000 as any,
    valorTotal: 1000 as any,
    valorParcela: 100 as any,
    taxaJuros: 1 as any,
    vencimento,
    quitada: false,
    quitadaEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

function meta(overrides: Partial<Meta> = {}): Meta {
  return {
    id: "m1",
    usuarioId: "u1",
    tipo: "OUTRO",
    descricao: "Meta",
    valorAlvo: 1000 as any,
    valorAtual: 0 as any,
    prazo: new Date("2020-01-01"),
    criadoEm: new Date("2019-01-01"),
    atualizadoEm: new Date(),
    ...overrides,
  };
}

describe("alertasLimites", () => {
  it("gera alerta só para categorias em aviso ou estouro", () => {
    const progresso: ProgressoLimite[] = [
      { categoria: "LAZER", valorLimite: 100, gastoAtual: 120, percentual: 120, situacao: "estouro" },
      { categoria: "MORADIA", valorLimite: 100, gastoAtual: 10, percentual: 10, situacao: "ok" },
    ];
    const alertas = alertasLimites(progresso, { LAZER: "Lazer", MORADIA: "Moradia" });
    expect(alertas).toHaveLength(1);
    expect(alertas[0].severidade).toBe("estouro");
  });
});

describe("alertasCartoes", () => {
  it("alerta quando o fechamento está dentro da antecedência", () => {
    const alertas = alertasCartoes([cartao({ diaFechamento: 18, diaVencimento: 28 })], REFERENCIA);
    expect(alertas.some((a) => a.id.startsWith("cartao-fechamento-"))).toBe(true);
  });

  it("não alerta quando fechamento e vencimento estão distantes", () => {
    const alertas = alertasCartoes([cartao({ diaFechamento: 1, diaVencimento: 5 })], REFERENCIA);
    expect(alertas).toHaveLength(0);
  });
});

describe("alertasDividas", () => {
  it("marca como urgente quando já venceu", () => {
    const alertas = alertasDividas([divida(new Date("2026-07-10"))], REFERENCIA);
    expect(alertas[0].severidade).toBe("urgente");
  });

  it("marca como aviso quando vence em breve, mas ainda não venceu", () => {
    const alertas = alertasDividas([divida(new Date("2026-07-17"))], REFERENCIA);
    expect(alertas[0].severidade).toBe("aviso");
  });

  it("não alerta quando o vencimento está distante", () => {
    const alertas = alertasDividas([divida(new Date("2026-09-01"))], REFERENCIA);
    expect(alertas).toHaveLength(0);
  });
});

describe("alertasMetas", () => {
  it("alerta metas atrasadas", () => {
    const alertas = alertasMetas([meta()]);
    expect(alertas).toHaveLength(1);
  });

  it("não alerta metas em dia", () => {
    const futuro = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    const alertas = alertasMetas([meta({ prazo: futuro, criadoEm: new Date() })]);
    expect(alertas).toHaveLength(0);
  });

  it("sugere um aporte mensal para recuperar o ritmo quando o prazo ainda não venceu", () => {
    const criadoEm = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const prazoProximo = new Date(Date.now() + 1000 * 60 * 60 * 24 * 300);
    const alertas = alertasMetas([
      meta({ valorAtual: 100 as any, valorAlvo: 10000 as any, criadoEm, prazo: prazoProximo }),
    ]);
    expect(alertas[0].descricao).toMatch(/aportar cerca de/i);
  });

  it("mantém a mensagem genérica quando o prazo já venceu (sem meses para calcular)", () => {
    const alertas = alertasMetas([meta()]);
    expect(alertas[0].descricao).toMatch(/não será concluída dentro do prazo/i);
  });
});

describe("ordenarPorSeveridade", () => {
  it("ordena estouro, depois urgente, depois aviso", () => {
    const alertas: Alerta[] = [
      { id: "1", severidade: "aviso", titulo: "", descricao: "", href: "" },
      { id: "2", severidade: "estouro", titulo: "", descricao: "", href: "" },
      { id: "3", severidade: "urgente", titulo: "", descricao: "", href: "" },
    ];
    expect(ordenarPorSeveridade(alertas).map((a) => a.severidade)).toEqual(["estouro", "urgente", "aviso"]);
  });
});
