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
