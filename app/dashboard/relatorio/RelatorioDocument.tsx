import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DadosRelatorio } from "@/lib/relatorio";

const CORES = {
  azul: "#1F3F75",
  verde: "#21873B",
  vermelho: "#D92D20",
  amarelo: "#F4B000",
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
  linhaResumo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  labelResumo: { color: CORES.textoSecundario },
  valorResumo: { fontWeight: 700 },
  barraFundo: { height: 8, backgroundColor: "#F1F3F6", borderRadius: 4, marginTop: 3, marginBottom: 2 },
  barraPreenchimento: { height: 8, borderRadius: 4 },
  linhaCategoria: { marginBottom: 10 },
  linhaCategoriaTexto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  linhaMeta: { marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${CORES.borda}` },
  linhaMetaTexto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  situacao: { fontSize: 9 },
  vazio: { color: CORES.textoSecundario, fontStyle: "italic" },
  rodape: { position: "absolute", bottom: 28, left: 32, right: 32, fontSize: 8, color: CORES.textoSecundario, lineHeight: 1.4 },
});

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NOME_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const COR_SITUACAO_META: Record<string, string> = {
  concluida: CORES.verde,
  atrasada: CORES.vermelho,
  em_dia: CORES.azul,
};

const TEXTO_SITUACAO_META: Record<string, string> = {
  concluida: "Concluída",
  atrasada: "Atrasada",
  em_dia: "No prazo",
};

export function RelatorioDocument({ dados }: { dados: DadosRelatorio }) {
  const maiorValor = Math.max(dados.totalReceitas, dados.totalDespesas, 1);

  return (
    <Document title={`FinClara - Relatório ${NOME_MES[dados.mes - 1]} de ${dados.ano}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.marca}>FinClara</Text>
          <Text style={styles.subtitulo}>
            Relatório mensal · {NOME_MES[dados.mes - 1]} de {dados.ano}
          </Text>
        </View>

        {/* Receitas x despesas */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Receitas x despesas</Text>

          <View style={styles.linhaResumo}>
            <Text style={styles.labelResumo}>Receitas</Text>
            <Text style={{ ...styles.valorResumo, color: CORES.verde }}>{formatarMoeda(dados.totalReceitas)}</Text>
          </View>
          <View style={styles.barraFundo}>
            <View style={{ ...styles.barraPreenchimento, width: `${(dados.totalReceitas / maiorValor) * 100}%`, backgroundColor: CORES.verde }} />
          </View>

          <View style={{ ...styles.linhaResumo, marginTop: 8 }}>
            <Text style={styles.labelResumo}>Despesas</Text>
            <Text style={{ ...styles.valorResumo, color: CORES.vermelho }}>{formatarMoeda(dados.totalDespesas)}</Text>
          </View>
          <View style={styles.barraFundo}>
            <View style={{ ...styles.barraPreenchimento, width: `${(dados.totalDespesas / maiorValor) * 100}%`, backgroundColor: CORES.vermelho }} />
          </View>

          <View style={{ ...styles.linhaResumo, marginTop: 10 }}>
            <Text style={styles.labelResumo}>Saldo do mês</Text>
            <Text style={{ ...styles.valorResumo, color: dados.saldo >= 0 ? CORES.verde : CORES.vermelho }}>
              {formatarMoeda(dados.saldo)}
            </Text>
          </View>
        </View>

        {/* Gastos por categoria */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Gastos por categoria</Text>
          {dados.gastosPorCategoria.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma despesa registrada neste mês.</Text>
          ) : (
            dados.gastosPorCategoria.map((g) => (
              <View key={g.categoria} style={styles.linhaCategoria}>
                <View style={styles.linhaCategoriaTexto}>
                  <Text>{g.label}</Text>
                  <Text>{formatarMoeda(g.valor)} ({Math.round(g.percentual)}%)</Text>
                </View>
                <View style={styles.barraFundo}>
                  <View style={{ ...styles.barraPreenchimento, width: `${g.percentual}%`, backgroundColor: CORES.azul }} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Evolução das metas */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Evolução das metas</Text>
          {dados.metas.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma meta cadastrada.</Text>
          ) : (
            dados.metas.map((m, i) => (
              <View key={i} style={styles.linhaMeta}>
                <View style={styles.linhaMetaTexto}>
                  <Text>{m.descricao} ({m.tipo})</Text>
                  <Text style={{ color: COR_SITUACAO_META[m.situacao] }}>{TEXTO_SITUACAO_META[m.situacao]}</Text>
                </View>
                <View style={styles.linhaMetaTexto}>
                  <Text style={styles.situacao}>
                    {formatarMoeda(m.valorAtual)} de {formatarMoeda(m.valorAlvo)}
                  </Text>
                  <Text style={styles.situacao}>{Math.round(m.percentual)}%</Text>
                </View>
                <View style={styles.barraFundo}>
                  <View style={{ ...styles.barraPreenchimento, width: `${m.percentual}%`, backgroundColor: COR_SITUACAO_META[m.situacao] }} />
                </View>
              </View>
            ))
          )}
        </View>

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
