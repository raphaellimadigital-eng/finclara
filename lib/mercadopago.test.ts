import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import {
  mapearStatusMercadoPago,
  montarManifestAssinatura,
  verificarAssinaturaWebhook,
} from "./mercadopago";

describe("mapearStatusMercadoPago", () => {
  it("mapeia authorized para ATIVA", () => {
    expect(mapearStatusMercadoPago("authorized")).toBe("ATIVA");
  });

  it("mapeia paused para PAUSADA", () => {
    expect(mapearStatusMercadoPago("paused")).toBe("PAUSADA");
  });

  it("mapeia cancelled para CANCELADA", () => {
    expect(mapearStatusMercadoPago("cancelled")).toBe("CANCELADA");
  });

  it("mapeia pending para PENDENTE", () => {
    expect(mapearStatusMercadoPago("pending")).toBe("PENDENTE");
  });

  it("mapeia qualquer status desconhecido para PENDENTE (conservador)", () => {
    expect(mapearStatusMercadoPago("algo_novo_da_api")).toBe("PENDENTE");
  });
});

describe("montarManifestAssinatura", () => {
  it("segue o formato id:...;request-id:...;ts:...; da documentação do Mercado Pago", () => {
    expect(montarManifestAssinatura("123", "1700000000", "req-abc")).toBe(
      "id:123;request-id:req-abc;ts:1700000000;"
    );
  });
});

describe("verificarAssinaturaWebhook", () => {
  const segredo = "segredo-de-teste";
  const dataId = "123456";
  const xRequestId = "req-abc-123";
  // O validador do SDK rejeita timestamps fora de uma janela de tolerância (proteção contra
  // replay) — os testes precisam de um ts próximo de agora, não um valor fixo do passado.
  const tsAgora = String(Date.now());

  function assinar(manifest: string) {
    return createHmac("sha256", segredo).update(manifest).digest("hex");
  }

  it("aceita uma assinatura válida", () => {
    const manifest = montarManifestAssinatura(dataId, tsAgora, xRequestId);
    const v1 = assinar(manifest);
    const headers = { xSignature: `ts=${tsAgora},v1=${v1}`, xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(true);
  });

  it("rejeita quando o v1 não bate com o segredo", () => {
    const headers = { xSignature: `ts=${tsAgora},v1=assinaturafalsa`, xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });

  it("rejeita quando o dataId foi adulterado em relação ao assinado", () => {
    const manifest = montarManifestAssinatura("id-diferente", tsAgora, xRequestId);
    const v1 = assinar(manifest);
    const headers = { xSignature: `ts=${tsAgora},v1=${v1}`, xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });

  it("rejeita quando falta o header x-signature", () => {
    const headers = { xSignature: null, xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });

  it("rejeita quando falta o header x-request-id (entra na manifest como ausente)", () => {
    const manifest = montarManifestAssinatura(dataId, tsAgora, "");
    const v1 = assinar(manifest);
    const headers = { xSignature: `ts=${tsAgora},v1=${v1}`, xRequestId: null };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });

  it("rejeita um x-signature malformado (sem ts nem hash de versão)", () => {
    const headers = { xSignature: "formato-invalido", xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });

  it("rejeita um ts fora da janela de tolerância contra replay", () => {
    const tsAntigo = String(Date.now() - 10 * 60 * 1000); // 10 minutos atrás
    const manifest = montarManifestAssinatura(dataId, tsAntigo, xRequestId);
    const v1 = assinar(manifest);
    const headers = { xSignature: `ts=${tsAntigo},v1=${v1}`, xRequestId };
    expect(verificarAssinaturaWebhook(headers, dataId, segredo)).toBe(false);
  });
});
