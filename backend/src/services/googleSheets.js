import { google } from 'googleapis';
import { CACHE_TTL_SECONDS, validarConfiguracaoGoogle } from '../config.js';
import { normalizarCabecalho, texto } from '../utils/normalizacao.js';
import { formatarData, parseDataPlanilha } from '../utils/datas.js';

let cache = { expiraEm: 0, dados: null };

function escaparNomeAba(nome) {
  return `'${nome.replace(/'/g, "''")}'`;
}

export function mapearLinhas(values = []) {
  if (!values.length) return [];
  const cabecalhos = values[0].map(normalizarCabecalho);
  return values.slice(1).map((linha, indice) => {
    const registro = Object.fromEntries(cabecalhos.map((cabecalho, i) => [cabecalho, linha[i] ?? '']));
    const data = parseDataPlanilha(registro.data_da_venda);
    return {
      numeroLinha: indice + 2,
      vendedor: texto(registro.vendedor),
      cpf: texto(registro.cpf),
      nomeCliente: texto(registro.nome_cliente),
      produto: texto(registro.produto_adquirido) || 'NÃO INFORMADO',
      dataVenda: data,
      dataVendaChave: data ? formatarData(data) : ''
    };
  }).filter((registro) => registro.vendedor && registro.dataVenda);
}

export async function lerVendas({ ignorarCache = false } = {}) {
  if (!ignorarCache && cache.dados && Date.now() < cache.expiraEm) return cache.dados;
  validarConfiguracaoGoogle();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      project_id: process.env.GOOGLE_PROJECT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const nomeAba = process.env.GOOGLE_SHEET_NAME || 'Respostas ao formulário 1';
  const resposta = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${escaparNomeAba(nomeAba)}!A:L`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  const dados = mapearLinhas(resposta.data.values || []);
  cache = { dados, expiraEm: Date.now() + CACHE_TTL_SECONDS * 1000 };
  return dados;
}

export function limparCache() {
  cache = { expiraEm: 0, dados: null };
}
