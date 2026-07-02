import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  linhaMes: { marginBottom: 10 },
  linhaMesTexto: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  barraFundo: { height: 8, backgroundColor: "#F1F3F6", borderRadius: 4 },
  barraPreenchimento: { height: 8, borderRadius: 4 },
  vazio: { color: CORES.textoSecundario, fontStyle: "italic", lineHeight: 1.6 },
  rodape: { position: "absolute", bottom: 28, left: 32, right: 32, fontSize: 8, color: CORES.textoSecundario, lineHeight: 1.4 },
});

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NOME_MES_ABREV = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type Ponto = { ano: number; mes: number; patrimonio: number };

export function EvolucaoPatrimonialDocument({ historico }: { historico: Ponto[] }) {
  const temHistoricoSuficiente = historico.length >= 2;
  const maiorValor = Math.max(...historico.map((p) => Math.abs(p.patrimonio)), 1);

  return (
    <Document title="FinClara - Evolução Patrimonial">
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.marca}>FinClara</Text>
          <Text style={styles.subtitulo}>Evolução patrimonial</Text>
        </View>

        {historico.length === 0 && (
          <View style={styles.secao}>
            <Text style={styles.vazio}>
              Ainda não há dados suficientes para este relatório. O FinClara passou a registrar um
              retrato do seu patrimônio (metas acumuladas menos dívidas) a cada mês que você acessa
              o app. Volte aqui daqui a alguns meses para ver a evolução.
            </Text>
          </View>
        )}

        {historico.length === 1 && (
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Patrimônio atual</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {formatarMoeda(historico[0].patrimonio)}
            </Text>
            <Text style={styles.vazio}>
              Esse é o primeiro mês registrado. A partir do próximo mês em que você acessar o
              FinClara, este relatório passa a mostrar a evolução ao longo do tempo.
            </Text>
          </View>
        )}

        {temHistoricoSuficiente && (
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Patrimônio mês a mês</Text>
            {historico.map((p, i) => (
              <View key={`${p.ano}-${p.mes}`} style={styles.linhaMes}>
                <View style={styles.linhaMesTexto}>
                  <Text>{NOME_MES_ABREV[p.mes - 1]}/{p.ano}</Text>
                  <Text style={{ fontWeight: 700, color: p.patrimonio >= 0 ? CORES.verde : CORES.vermelho }}>
                    {formatarMoeda(p.patrimonio)}
                  </Text>
                </View>
                <View style={styles.barraFundo}>
                  <View
                    style={{
                      ...styles.barraPreenchimento,
                      width: `${(Math.abs(p.patrimonio) / maiorValor) * 100}%`,
                      backgroundColor: p.patrimonio >= 0 ? CORES.verde : CORES.vermelho,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.rodape}>
          Patrimônio = soma acumulada em metas (reserva, investimentos e outros objetivos) menos o
          total devido em dívidas cadastradas no momento de cada registro. Conteúdo educativo, não
          constitui recomendação de investimento. Gerado em {new Date().toLocaleDateString("pt-BR")}{" "}
          pelo FinClara.
        </Text>
      </Page>
    </Document>
  );
}
