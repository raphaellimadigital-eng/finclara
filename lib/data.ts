// Converte o valor de um <input type="date"> ("AAAA-MM-DD") para um Date no horário local do
// servidor, em vez de UTC. `new Date("AAAA-MM-DD")` interpreta a string como meia-noite UTC, o
// que pode "empurrar" a data para o dia (ou mês) anterior quando exibida/consultada em fusos
// horários atrás de UTC — o mesmo horário local usado para montar os intervalos de mês em
// getLancamentos. Isso garante que a data gravada bate com a data digitada.
export function parseDataLocal(valor: string): Date {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Confirma maioridade a partir da data de nascimento, contando o aniversário corretamente (não
// só a diferença de anos) — alguém que faz 18 anos amanhã ainda não é maior de idade hoje.
export function maiorDeIdade(dataNascimento: Date, idadeMinima = 18, agora = new Date()): boolean {
  const aniversarioEsteAno = new Date(
    agora.getFullYear(),
    dataNascimento.getMonth(),
    dataNascimento.getDate()
  );
  let idade = agora.getFullYear() - dataNascimento.getFullYear();
  if (aniversarioEsteAno > agora) idade -= 1;
  return idade >= idadeMinima;
}

export type MesAno = { mes: number; ano: number };

// Soma (ou subtrai, com quantidade negativa) meses a um {mes, ano} — usado pra projetar até
// quando um compromisso futuro (parcela de dívida ou de cartão, lançamento recorrente) se
// estende, sem precisar montar um Date só pra isso.
export function avancarMeses(base: MesAno, quantidade: number): MesAno {
  const totalMeses = base.mes - 1 + quantidade;
  return { ano: base.ano + Math.floor(totalMeses / 12), mes: (((totalMeses % 12) + 12) % 12) + 1 };
}

// Compara dois {mes, ano}: positivo se `a` é depois de `b`, negativo se antes, 0 se igual.
export function compararMesAno(a: MesAno, b: MesAno): number {
  return a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes;
}

// O mais tardio entre uma lista de {mes, ano} — usado pra achar até quando o calendário deve
// liberar navegação, dado vários compromissos futuros com datas-limite diferentes.
export function maisTardio(pontos: MesAno[]): MesAno {
  return pontos.reduce((maisTarde, atual) => (compararMesAno(atual, maisTarde) > 0 ? atual : maisTarde));
}
