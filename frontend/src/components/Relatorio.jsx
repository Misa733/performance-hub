import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Printer } from 'lucide-react';
import { numero, percentual } from '../utils.js';
import { StatCard } from './StatCard.jsx';

const tendenciaConfig = {
  'CRESCIMENTO': { icon: ArrowUpRight, classe: 'positivo' }, 'QUEDA': { icon: ArrowDownRight, classe: 'negativo' },
  'ESTÁVEL': { icon: ArrowRight, classe: 'neutro' }, 'SEM COMPARAÇÃO': { icon: ArrowRight, classe: 'neutro' }
};

export function Relatorio({ dados }) {
  const { periodo, desempenho, produtos, comparativo, auditoria, meta } = dados;
  const config = tendenciaConfig[comparativo.tendencia] || tendenciaConfig['SEM COMPARAÇÃO'];
  const Icone = config.icon;
  const maxProduto = Math.max(...produtos.distribuicao.map((item) => item.quantidade), 1);
  return <main className="relatorio" aria-live="polite">
    <header className="relatorio-cabecalho">
      <div><span className="sobretitulo">RELATÓRIO DE DESEMPENHO</span><h2>{dados.consultor}</h2><p><CalendarDays size={16} /> {periodo.inicio} a {periodo.fim} · {periodo.quantidade_dias} dias</p></div>
      <button className="botao-secundario no-print" onClick={() => window.print()}><Printer size={17} /> Imprimir / Salvar PDF</button>
    </header>
    <section className="stats-grid" aria-label="Indicadores principais">
      <StatCard rotulo="Vendas" valor={numero(desempenho.total_vendas)} detalhe="vendas únicas" />
      <StatCard rotulo="Clientes únicos" valor={numero(desempenho.clientes_unicos)} detalhe="no período" />
      <StatCard rotulo="Média por dia" valor={numero(desempenho.media_vendas_dia)} detalhe="vendas / dia" />
      <StatCard rotulo="Variação" valor={percentual(comparativo.variacao_percentual)} detalhe={comparativo.tendencia} tom={config.classe} />
    </section>
    <div className="conteudo-grid">
      <section className="painel comparativo"><div className="secao-titulo"><div><span className="sobretitulo">CONTEXTO</span><h3>Comparativo</h3></div><span className={`tendencia ${config.classe}`}><Icone size={16} /> {comparativo.tendencia}</span></div>
        <div className="comparativo-corpo"><div><span>Período anterior</span><strong>{comparativo.periodo_anterior}</strong></div><div><span>Vendas anteriores</span><strong>{numero(comparativo.vendas_periodo_anterior)}</strong></div><div><span>Variação</span><strong className={config.classe}>{percentual(comparativo.variacao_percentual)}</strong></div></div>
      </section>
      <section className="painel produtos"><div className="secao-titulo"><div><span className="sobretitulo">MIX DE VENDAS</span><h3>Produtos</h3></div><span className="contador">{produtos.quantidade_produtos_diferentes} diferentes</span></div>
        {produtos.distribuicao.length ? <div className="barras">{produtos.distribuicao.map((item) => <div className="barra-item" key={item.produto}><div><span>{item.produto}</span><strong>{item.quantidade}</strong></div><div className="trilho"><span style={{ width: `${(item.quantidade / maxProduto) * 100}%` }} /></div></div>)}</div> : <p className="vazio">Nenhuma venda encontrada neste período.</p>}
      </section>
    </div>
    {dados.meta_aplicavel && meta && <section className="painel meta"><div className="meta-topo"><div><span className="sobretitulo">ACOMPANHAMENTO MENSAL</span><h3>Meta de {meta.meta_mensal} vendas</h3></div><span className={`situacao ${meta.situacao === 'ABAIXO DO RITMO' ? 'atencao' : ''}`}>{meta.situacao}</span></div>
      <div className="progresso"><span style={{ width: `${Math.min(meta.percentual_atingido, 100)}%` }} /></div>
      <div className="meta-grid"><div><span>Realizadas</span><strong>{meta.vendas_realizadas}</strong></div><div><span>Faltam</span><strong>{meta.faltam_para_meta}</strong></div><div><span>Atingido</span><strong>{percentual(meta.percentual_atingido)}</strong></div><div><span>Dias restantes</span><strong>{meta.dias_restantes_mes}</strong></div><div><span>Ritmo necessário</span><strong>{meta.ritmo_necessario_vendas_dia == null ? 'Impossível no período' : `${numero(meta.ritmo_necessario_vendas_dia)} / dia`}</strong></div></div>
    </section>}
    <details className="auditoria"><summary>Conferência dos dados</summary><div><span>Período atual: {auditoria.registros_encontrados_periodo} registros, {auditoria.vendas_unicas_periodo} vendas únicas, {auditoria.duplicidades_ignoradas_periodo} duplicidades ignoradas.</span><span>Comparativo: {auditoria.registros_encontrados_comparativo} registros, {auditoria.vendas_unicas_comparativo} vendas únicas, {auditoria.duplicidades_ignoradas_comparativo} duplicidades ignoradas.</span></div></details>
  </main>;
}
