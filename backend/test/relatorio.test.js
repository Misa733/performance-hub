import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarRelatorio } from '../src/services/relatorioService.js';
import { formatarData, parseDataApi } from '../src/utils/datas.js';

function venda(data, extra = {}) { const d = parseDataApi(data); return { vendedor:'BRUNA RAÍSSA',cpf:'1',nomeCliente:'Ana',produto:'CHIP',dataVenda:d,dataVendaChave:formatarData(d),...extra }; }
test('gera indicadores, auditoria, comparação e meta', () => {
  const vendas=[venda('2026-08-04'),venda('2026-08-04'),venda('2026-08-05',{cpf:'2',produto:'FIBRA'}),venda('2026-07-04')];
  const r=gerarRelatorio(vendas,'bruna raissa',parseDataApi('2026-08-01'),parseDataApi('2026-08-14'));
  assert.equal(r.desempenho.total_vendas,2); assert.equal(r.auditoria.duplicidades_ignoradas_periodo,1);
  assert.equal(r.comparativo.vendas_periodo_anterior,1); assert.equal(r.comparativo.variacao_percentual,100);
  assert.equal(r.meta_aplicavel,true); assert.equal(r.produtos.quantidade_produtos_diferentes,2);
});
test('não divide por zero e oculta meta fora do início do mês',()=>{
  const r=gerarRelatorio([venda('2026-08-05')],'BRUNA RAISSA',parseDataApi('2026-08-05'),parseDataApi('2026-08-14'));
  assert.equal(r.comparativo.variacao_percentual,null); assert.equal(r.comparativo.tendencia,'SEM COMPARAÇÃO'); assert.equal(r.meta_aplicavel,false); assert.equal(r.meta,null);
});
