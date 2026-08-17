export function texto(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function normalizarTexto(value) {
  return texto(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function normalizarCabecalho(value) {
  return normalizarTexto(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function somenteDigitos(value) {
  return String(value ?? '').replace(/\D/g, '');
}
