import { useEffect, useState } from 'react';
import { BarChart3, LoaderCircle, Search, Sparkles } from 'lucide-react';
import { buscarRelatorio, buscarVendedores } from './services/api.js';
import { normalizar, relatorioValido } from './utils.js';
import { ConsultorAutocomplete } from './components/ConsultorAutocomplete.jsx';
import { Relatorio } from './components/Relatorio.jsx';

function dataLocalApi(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function App() {
  const [vendedores, setVendedores] = useState([]), [consultor, setConsultor] = useState('');
  const hoje = new Date();
  const [inicio, setInicio] = useState(() => dataLocalApi(new Date(hoje.getFullYear(), hoje.getMonth(), 1)));
  const [fim, setFim] = useState(() => dataLocalApi(hoje));
  const [carregando, setCarregando] = useState(false), [carregandoLista, setCarregandoLista] = useState(true);
  const [erro, setErro] = useState(''), [relatorio, setRelatorio] = useState(null);
  useEffect(() => { buscarVendedores().then((d) => {
    if (!Array.isArray(d?.vendedores)) throw new Error('A lista de consultores não está disponível.');
    setVendedores(d.vendedores);
  }).catch((e) => setErro(e.message)).finally(() => setCarregandoLista(false)); }, []);

  async function enviar(evento) {
    evento.preventDefault(); setErro(''); setRelatorio(null);
    const vendedorValido = vendedores.some((nome) => normalizar(nome) === normalizar(consultor));
    if (!vendedorValido) return setErro('Selecione um consultor válido na lista.');
    if (!inicio || !fim) return setErro('Informe a data inicial e a data final.');
    if (inicio > fim) return setErro('A data inicial não pode ser posterior à data final.');
    setCarregando(true);
    try {
      const dados = await buscarRelatorio({ consultor, data_inicio: inicio, data_fim: fim });
      if (!relatorioValido(dados)) throw new Error('O relatório recebido está incompleto. Tente novamente.');
      setRelatorio(dados);
      requestAnimationFrame(() => document.querySelector('.relatorio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (e) { setErro(e.message); } finally { setCarregando(false); }
  }

  return <><header className="topbar"><a className="marca" href="#topo"><span><BarChart3 size={21} /></span><strong>Portal Comercial</strong></a><span className="status"><i /> Dados integrados</span></header>
    <div id="topo" className="pagina"><section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> INTELIGÊNCIA COMERCIAL</span><h1>Desempenho claro.<br /><em>Decisões melhores.</em></h1><p>Transforme suas vendas em uma leitura simples do que avançou, do que mudou e de onde focar agora.</p></div>
      <form className="filtros" onSubmit={enviar}><div className="form-titulo"><span><Search size={19} /></span><div><h2>Gerar relatório</h2><p>Escolha o consultor e o período da análise.</p></div></div>
        <ConsultorAutocomplete vendedores={vendedores} value={consultor} onChange={setConsultor} disabled={carregandoLista} />
        <div className="datas"><label>Data inicial<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label><label>Data final<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label></div>
        {erro && <div className="erro" role="alert">{erro}</div>}
        <button className="botao-principal" disabled={carregando || carregandoLista}>{carregando ? <><LoaderCircle className="girando" size={18} /> Analisando vendas...</> : carregandoLista ? 'Carregando consultores...' : 'Gerar relatório'}</button>
      </form></section>
      {relatorio && <Relatorio dados={relatorio} />}
    </div><footer>Portal de Desempenho Comercial <span>•</span> Dados protegidos e atualizados diretamente da fonte</footer></>;
}
