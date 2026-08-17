import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { normalizar } from '../utils.js';

export function ConsultorAutocomplete({ vendedores, value, onChange, disabled }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  const opcoes = vendedores.filter((nome) => normalizar(nome).includes(normalizar(value))).slice(0, 8);
  useEffect(() => {
    const fechar = (evento) => { if (!ref.current?.contains(evento.target)) setAberto(false); };
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);
  return <div className="autocomplete" ref={ref}>
    <label htmlFor="consultor">Consultor</label>
    <div className="input-icon">
      <input id="consultor" role="combobox" aria-expanded={aberto} aria-controls="opcoes-consultor" autoComplete="off" placeholder="Digite um nome" value={value}
        disabled={disabled} onFocus={() => setAberto(true)} onChange={(e) => { onChange(e.target.value); setAberto(true); }} />
      <ChevronDown size={18} aria-hidden="true" />
    </div>
    {aberto && opcoes.length > 0 && <ul id="opcoes-consultor" className="opcoes" role="listbox">
      {opcoes.map((nome) => <li key={nome} role="option" aria-selected={nome === value} onMouseDown={() => { onChange(nome); setAberto(false); }}>
        <span>{nome}</span>{nome === value && <Check size={16} />}
      </li>)}
    </ul>}
  </div>;
}
