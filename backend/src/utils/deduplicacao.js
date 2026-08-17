import { normalizarTexto, somenteDigitos, texto } from './normalizacao.js';

export function chaveVenda(venda) {
  const vendedor = normalizarTexto(venda.vendedor);
  const cliente = somenteDigitos(venda.cpf) || normalizarTexto(venda.nomeCliente);
  return [vendedor, cliente, venda.dataVendaChave, normalizarTexto(venda.produto)].join('|');
}

export function deduplicarVendas(vendas) {
  const mapa = new Map();
  for (const venda of vendas) {
    const chave = chaveVenda(venda);
    if (!mapa.has(chave)) mapa.set(chave, venda);
  }
  return {
    vendas: [...mapa.values()],
    registros: vendas.length,
    duplicidades: vendas.length - mapa.size
  };
}

export function chaveCliente(venda) {
  return somenteDigitos(venda.cpf) || normalizarTexto(texto(venda.nomeCliente));
}
