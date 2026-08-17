import { META_MENSAL } from '../config.js';
import { adicionarDias, calcularPeriodoAnterior, diasNoMes, diferencaDias, formatarData, mesmoMes } from '../utils/datas.js';
import { chaveCliente, deduplicarVendas } from '../utils/deduplicacao.js';
import { normalizarTexto } from '../utils/normalizacao.js';

const arredondar = (numero) => Math.round((numero + Number.EPSILON) * 100) / 100;
const dentro = (data, inicio, fim) => data >= inicio && data <= fim;

function apurar(vendas, inicio, fim, consultorNormalizado) {
  const encontrados = vendas.filter((v) => normalizarTexto(v.vendedor) === consultorNormalizado && dentro(v.dataVenda, inicio, fim));
  return deduplicarVendas(encontrados);
}

function produtos(vendas) {
  const contagem = new Map();
  for (const venda of vendas) contagem.set(venda.produto, (contagem.get(venda.produto) || 0) + 1);
  const distribuicao = [...contagem.entries()]
    .map(([produto, quantidade]) => ({ produto, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade || a.produto.localeCompare(b.produto, 'pt-BR'));
  return {
    quantidade_produtos_diferentes: distribuicao.length,
    produto_mais_vendido: distribuicao[0] || null,
    distribuicao
  };
}

function tendencia(atual, anterior) {
  if (anterior === 0) return { variacao_percentual: null, tendencia: 'SEM COMPARAÇÃO' };
  const variacao = arredondar(((atual - anterior) / anterior) * 100);
  return { variacao_percentual: variacao, tendencia: variacao > 5 ? 'CRESCIMENTO' : variacao < -5 ? 'QUEDA' : 'ESTÁVEL' };
}

function calcularMeta(inicio, fim, vendas) {
  if (inicio.getDate() !== 1 || !mesmoMes(inicio, fim)) return null;
  const totalDias = diasNoMes(inicio);
  const diasDecorridos = fim.getDate();
  const faltam = Math.max(0, META_MENSAL - vendas);
  const diasRestantes = Math.max(0, totalDias - diasDecorridos);
  const percentualAtingido = arredondar((vendas / META_MENSAL) * 100);
  const percentualDecorrido = arredondar((diasDecorridos / totalDias) * 100);
  return {
    meta_mensal: META_MENSAL,
    vendas_realizadas: vendas,
    percentual_atingido: percentualAtingido,
    faltam_para_meta: faltam,
    percentual_mes_decorrido: percentualDecorrido,
    situacao: vendas >= META_MENSAL ? 'META ATINGIDA' : percentualAtingido >= percentualDecorrido ? 'ACIMA DO RITMO' : 'ABAIXO DO RITMO',
    dias_restantes_mes: diasRestantes,
    ritmo_necessario_vendas_dia: diasRestantes ? arredondar(faltam / diasRestantes) : (faltam ? null : 0)
  };
}

export function gerarRelatorio(vendas, consultor, inicio, fim) {
  const quantidadeDias = diferencaDias(inicio, fim) + 1;
  const anterior = calcularPeriodoAnterior(inicio, fim);
  const atual = apurar(vendas, inicio, fim, normalizarTexto(consultor));
  const comparativo = apurar(vendas, anterior.inicio, anterior.fim, normalizarTexto(consultor));
  const totalAtual = atual.vendas.length;
  const totalAnterior = comparativo.vendas.length;
  const meta = calcularMeta(inicio, fim, totalAtual);
  return {
    sucesso: true,
    consultor,
    periodo: { inicio: formatarData(inicio), fim: formatarData(fim), quantidade_dias: quantidadeDias },
    desempenho: {
      total_vendas: totalAtual,
      clientes_unicos: new Set(atual.vendas.map(chaveCliente).filter(Boolean)).size,
      media_vendas_dia: arredondar(totalAtual / quantidadeDias)
    },
    auditoria: {
      registros_encontrados_periodo: atual.registros,
      vendas_unicas_periodo: totalAtual,
      duplicidades_ignoradas_periodo: atual.duplicidades,
      registros_encontrados_comparativo: comparativo.registros,
      vendas_unicas_comparativo: totalAnterior,
      duplicidades_ignoradas_comparativo: comparativo.duplicidades
    },
    produtos: produtos(atual.vendas),
    comparativo: {
      periodo_anterior: `${formatarData(anterior.inicio)} a ${formatarData(anterior.fim)}`,
      vendas_periodo_anterior: totalAnterior,
      ...tendencia(totalAtual, totalAnterior)
    },
    meta_aplicavel: Boolean(meta),
    meta
  };
}
