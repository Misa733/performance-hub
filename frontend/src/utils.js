export const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export const percentual = (valor) => valor == null ? '—' : `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
export const numero = (valor) => Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function relatorioValido(dados) {
  if (!dados || dados.sucesso !== true || typeof dados.consultor !== 'string') return false;
  if (!dados.periodo || typeof dados.periodo.inicio !== 'string' || typeof dados.periodo.fim !== 'string') return false;
  if (!dados.desempenho || typeof dados.desempenho.total_vendas !== 'number' || typeof dados.desempenho.clientes_unicos !== 'number') return false;
  if (!dados.produtos || !Array.isArray(dados.produtos.distribuicao)) return false;
  if (!dados.comparativo || typeof dados.comparativo.periodo_anterior !== 'string' || typeof dados.comparativo.tendencia !== 'string') return false;
  if (!dados.auditoria || typeof dados.auditoria.registros_encontrados_periodo !== 'number') return false;
  if (typeof dados.meta_aplicavel !== 'boolean') return false;
  if (dados.meta_aplicavel && !dados.meta) return false;
  return true;
}
