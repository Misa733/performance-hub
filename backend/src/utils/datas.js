const PAD = (n) => String(n).padStart(2, '0');

export function criarDataLocal(ano, mes, dia) {
  const data = new Date(ano, mes - 1, dia, 12, 0, 0, 0);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return data;
}

export function parseDataApi(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  return match ? criarDataLocal(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

export function parseDataPlanilha(value) {
  const texto = String(value || '').trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(texto);
  return match ? criarDataLocal(Number(match[3]), Number(match[2]), Number(match[1])) : null;
}

export function formatarData(data) {
  return `${PAD(data.getDate())}/${PAD(data.getMonth() + 1)}/${data.getFullYear()}`;
}

export function adicionarDias(data, dias) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

export function diferencaDias(inicio, fim) {
  const a = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  const b = Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate());
  return Math.round((b - a) / 86400000);
}

export function mesmoMes(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function diasNoMes(data) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
}

function deslocarMesSeguro(data, delta) {
  const primeiro = new Date(data.getFullYear(), data.getMonth() + delta, 1, 12);
  const dia = Math.min(data.getDate(), diasNoMes(primeiro));
  return new Date(primeiro.getFullYear(), primeiro.getMonth(), dia, 12);
}

export function calcularPeriodoAnterior(inicio, fim) {
  if (mesmoMes(inicio, fim)) {
    return { inicio: deslocarMesSeguro(inicio, -1), fim: deslocarMesSeguro(fim, -1) };
  }
  const quantidadeDias = diferencaDias(inicio, fim) + 1;
  const fimAnterior = adicionarDias(inicio, -1);
  return { inicio: adicionarDias(fimAnterior, -(quantidadeDias - 1)), fim: fimAnterior };
}
