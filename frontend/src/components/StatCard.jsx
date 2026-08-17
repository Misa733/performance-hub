export function StatCard({ rotulo, valor, detalhe, tom = '' }) {
  return <article className={`stat-card ${tom}`}>
    <span>{rotulo}</span><strong>{valor}</strong>{detalhe && <small>{detalhe}</small>}
  </article>;
}
