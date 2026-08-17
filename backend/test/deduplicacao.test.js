import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicarVendas } from '../src/utils/deduplicacao.js';

const base = { vendedor: 'BRUNA RAÍSSA', cpf: '123.456.789-00', nomeCliente: 'Ana', dataVendaChave: '04/08/2026', produto: 'CHIP 29,99' };
test('elimina venda repetida por vendedor, CPF, data e produto', () => {
  const resultado = deduplicarVendas([base, { ...base, vendedor: ' bruna raissa ', cpf: '12345678900' }]);
  assert.equal(resultado.vendas.length, 1); assert.equal(resultado.duplicidades, 1);
});
test('usa nome normalizado quando CPF está vazio', () => {
  const resultado = deduplicarVendas([{ ...base, cpf: '', nomeCliente: 'João Ávila' }, { ...base, cpf: '', nomeCliente: ' joao avila ' }]);
  assert.equal(resultado.vendas.length, 1);
});
