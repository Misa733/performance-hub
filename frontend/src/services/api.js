const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3001')
  .trim()
  .replace(/\/+$/, '');

const esperar = (milissegundos) => new Promise((resolve) => setTimeout(resolve, milissegundos));

async function requisicao(caminho, opcoes, tentativas = 1) {
  let resposta;
  for (let tentativa = 1; tentativa <= tentativas; tentativa += 1) {
    try {
      resposta = await fetch(`${API_URL}${caminho}`, opcoes);
      break;
    } catch {
      if (tentativa === tentativas) {
        throw new Error(`Não foi possível conectar à API em ${API_URL}. Confirme se o backend está ativo.`);
      }
      await esperar(500 * tentativa);
    }
  }
  let dados;
  try { dados = await resposta.json(); } catch { throw new Error('O servidor devolveu uma resposta inválida.'); }
  if (!dados || typeof dados !== 'object') throw new Error('O servidor devolveu uma resposta inválida.');
  if (!resposta.ok || dados?.sucesso === false) throw new Error(dados?.mensagem || 'Não foi possível concluir a solicitação.');
  return dados;
}

let vendedoresEmCarregamento;

export function buscarVendedores() {
  if (!vendedoresEmCarregamento) {
    vendedoresEmCarregamento = requisicao('/api/vendedores', undefined, 5)
      .catch((erro) => {
        vendedoresEmCarregamento = undefined;
        throw erro;
      });
  }
  return vendedoresEmCarregamento;
}

export const buscarRelatorio = (filtros) => requisicao('/api/relatorio', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filtros)
}, 3);
