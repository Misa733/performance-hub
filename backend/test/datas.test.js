import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularPeriodoAnterior, formatarData, parseDataApi, parseDataPlanilha } from '../src/utils/datas.js';

test('interpreta datas sem deslocamento de timezone', () => {
  assert.equal(formatarData(parseDataApi('2026-08-04')), '04/08/2026');
  assert.equal(formatarData(parseDataPlanilha('04/08/2026 09:32:00')), '04/08/2026');
  assert.equal(parseDataApi('2026-02-30'), null);
});
test('mesmo mês compara o mesmo intervalo no mês anterior', () => {
  const p = calcularPeriodoAnterior(parseDataApi('2026-08-05'), parseDataApi('2026-08-14'));
  assert.deepEqual([formatarData(p.inicio), formatarData(p.fim)], ['05/07/2026', '14/07/2026']);
});
test('período cruzado compara janela anterior de mesma duração', () => {
  const p = calcularPeriodoAnterior(parseDataApi('2026-06-15'), parseDataApi('2026-07-15'));
  assert.deepEqual([formatarData(p.inicio), formatarData(p.fim)], ['15/05/2026', '14/06/2026']);
});
