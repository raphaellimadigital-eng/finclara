import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DadosRelatorio } from "@/lib/relatorio";

const CORES = {
  azul: "#1F3F75",
  verde: "#21873B",
  vermelho: "#D92D20",
  textoSecundario: "#4B5563",
  borda: "#E5E7EB",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#111827", fontFamily: "Helvetica" },
  cabecalho: { marginBottom: 20, borderBottom: `2px solid ${CORES.azul}`, paddingBottom: 12 },
  marca: { fontSize: 18, fontWeight: 700, color: CORES.azul, marginBottom: 2 },
  subtitulo: { fontSize: 11, color: CORES.textoSecundario },
  secao: { marginBottom: 18 },
  tituloSecao: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: CORES.azul },
  linhaComparativo: { flexDirection: "row", marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${CORES.borda}` },
  colunaLabel: { width: "34%", color: CORES.textoSecundario },
  colunaValor: { width: "33%", textAlign: "right" },
  colunaVariacao: { width: "33%", textAlign: "right", fontWeight: 700 },
  vazio: { color: CORES.textoSecundario, fontStyle: "italic", lineHeight: 1.6 },
  rodape: { position: "absolute", bottom: 28, left: 32, right: 32, fontSize: 8, color: CORES.textoSecundario, lineHeight: 1.4 },
});

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NOME_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function calcularVariacao(atual: number, anterior: number): string {
  if (anterior === 0) return atual === 0 ? "-" : "novo";
  const variacao = ((atual - anterior) / anterior) * 100;
  const sinal = variacao > 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(0)}%`;
}

function corVariacao(atual: number, anterior: number, quantoMenorMelhor: boolean): string {
  if (atual === anterior) return CORES.textoSecundario;
  const melhorou = quantoMenorMelhor ? atual < anterior : atual > anterior;
  return melhorou ? CORES.verde : CORES.vermelho;
}

type Props = {
  atual: DadosRelatorio;
  anterior: DadosRelatorio | null;
};

export function ComparativoDocument({ atual, anterior }: Props) {
  return (
    <Document title={`FinClara - Comparativo ${NOME_MES[atual.mes - 1]} de ${atual.ano}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.marca}>FinClara</Text>
          <Text style={styles.subtitulo}>
            Comparativo mensal · {NOME_MES[atual.mes - 1]} de {atual.ano}
            {anterior ? ` vs. ${NOME_MES[anterior.mes - 1]} de ${anterior.ano}` : ""}
          </Text>
        </View>

        {!anterior ? (
          <View style={styles.secao}>
            <Text style={styles.vazio}>
              Sem lançamentos no mês anterior para comparar. Continue registrando seus lançamentos
              mês a mês para habilitar este relatório.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.secao}>
              <Text style={styles.tituloSecao}>Receitas x despesas</Text>

              <View style={styles.linhaComparativo}>
                <Text style={styles.colunaLabel}>Receitas</Text>
                <Text style={styles.colunaValor}>{formatarMoeda(atual.totalReceitas)}</Text>
                <Text style={{ ...styles.colunaVariacao, color: corVariacao(atual.totalReceitas, anterior.totalReceitas, false) }}>
                  {calcularVariacao(atual.totalReceitas, anterior.totalReceitas)}
                </Text>
              </View>
              <View style={styles.linhaComparativo}>
                <Text style={styles.colunaLabel}>Despesas</Text>
                <Text style={styles.colunaValor}>{formatarMoeda(atual.totalDespesas)}</Text>
                <Text style={{ ...styles.colunaVariacao, color: corVariacao(atual.totalDespesas, anterior.totalDespesas, true) }}>
                  {calcularVariacao(atual.totalDespesas, anterior.totalDespesas)}
                </Text>
              </View>
              <View style={{ ...styles.linhaComparativo, borderBottom: "none" }}>
                <Text style={styles.colunaLabel}>Saldo</Text>
                <Text style={styles.colunaValor}>{formatarMoeda(atual.saldo)}</Text>
                <Text style={{ ...styles.colunaVariacao, color: corVariacao(atual.saldo, anterior.saldo, false) }}>
                  {calcularVariacao(atual.saldo, anterior.saldo)}
                </Text>
              </View>
            </View>

            <View style={styles.secao}>
              <Text style={styles.tituloSecao}>Gastos por categoria</Text>
              {atual.gastosPorCategoria.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma despesa registrada neste mês.</Text>
              ) : (
                atual.gastosPorCategoria.map((g) => {
                  const anteriorCategoria = anterior.gastosPorCategoria.find((c) => c.categoria === g.categoria);
                  const valorAnterior = anteriorCategoria?.valor ?? 0;
                  return (
                    <View key={g.categoria} style={styles.linhaComparativo}>
                      <Text style={styles.colunaLabel}>{g.label}</Text>
                      <Text style={styles.colunaValor}>{formatarMoeda(g.valor)}</Text>
                      <Text style={{ ...styles.colunaVariacao, color: corVariacao(g.valor, valorAnterior, true) }}>
                        {calcularVariacao(g.valor, valorAnterior)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}

        <Text style={styles.rodape}>
          Conteúdo educativo, não constitui recomendação de investimento. O FinClara não indica
          produtos financeiros específicos nem promete rentabilidade. Consulte um profissional
          certificado (CVM/ANBIMA) antes de tomar decisões financeiras. Gerado em{" "}
          {new Date().toLocaleDateString("pt-BR")} pelo FinClara.
        </Text>
      </Page>
    </Document>
  );
}
