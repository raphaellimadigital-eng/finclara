import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Orientacao } from "@/lib/orientacao";

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
  paragrafo: { fontSize: 10, lineHeight: 1.6, marginBottom: 6 },
  barraFundo: { height: 8, backgroundColor: "#F1F3F6", borderRadius: 4, marginTop: 6, marginBottom: 4 },
  barraPreenchimento: { height: 8, borderRadius: 4 },
  caixaPrioridade: { padding: 12, borderRadius: 8, marginBottom: 8 },
  rodape: { position: "absolute", bottom: 28, left: 32, right: 32, fontSize: 8, color: CORES.textoSecundario, lineHeight: 1.4 },
});

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NOME_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const COR_PRIORIDADE: Record<string, string> = {
  QUITAR_DIVIDA: CORES.vermelho,
  FORMAR_RESERVA: CORES.amarelo,
  INVESTIR: CORES.verde,
};

type Props = {
  ano: number;
  mes: number;
  orientacao: Orientacao;
  textoIA: string;
};

export function DiagnosticoDocument({ ano, mes, orientacao, textoIA }: Props) {
  const cor = COR_PRIORIDADE[orientacao.prioridade] ?? CORES.azul;
  const percentualReserva = orientacao.reservaAlvo > 0
    ? Math.min((orientacao.reservaAtual / orientacao.reservaAlvo) * 100, 100)
    : 0;

  return (
    <Document title={`FinClara - Diagnóstico Financeiro ${NOME_MES[mes - 1]} de ${ano}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalho}>
          <Text style={styles.marca}>FinClara</Text>
          <Text style={styles.subtitulo}>
            Diagnóstico financeiro · {NOME_MES[mes - 1]} de {ano}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Sua prioridade agora</Text>
          <View style={{ ...styles.caixaPrioridade, backgroundColor: "#F1F3F6" }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: cor, marginBottom: 6 }}>
              {orientacao.titulo}
            </Text>
            <Text style={styles.paragrafo}>{orientacao.explicacao}</Text>
          </View>

          <Text style={{ ...styles.paragrafo, marginTop: 4 }}>
            Reserva de emergência: {formatarMoeda(orientacao.reservaAtual)} de {formatarMoeda(orientacao.reservaAlvo)}
            {" "}({orientacao.mesesReserva.toFixed(1)} meses de gastos essenciais cobertos)
          </Text>
          <View style={styles.barraFundo}>
            <View style={{ ...styles.barraPreenchimento, width: `${percentualReserva}%`, backgroundColor: percentualReserva >= 100 ? CORES.verde : CORES.amarelo }} />
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Análise personalizada (IA)</Text>
          <Text style={styles.paragrafo}>{textoIA}</Text>
        </View>

        <Text style={styles.rodape}>
          Conteúdo educativo, gerado automaticamente com base nos seus dados e não constitui
          recomendação de investimento. O FinClara não indica produtos financeiros específicos nem
          promete rentabilidade. Consulte um profissional certificado (CVM/ANBIMA) antes de tomar
          decisões financeiras. Gerado em {new Date().toLocaleDateString("pt-BR")} pelo FinClara.
        </Text>
      </Page>
    </Document>
  );
}
