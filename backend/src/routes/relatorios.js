import { Router } from 'express';
import { lerVendas } from '../services/googleSheets.js';
import { gerarRelatorio } from '../services/relatorioService.js';
import { parseDataApi } from '../utils/datas.js';
import { texto } from '../utils/normalizacao.js';

export const relatoriosRouter = Router();

relatoriosRouter.post('/', async (req, res, next) => {
  try {
    const consultor = texto(req.body?.consultor);
    const inicio = parseDataApi(req.body?.data_inicio);
    const fim = parseDataApi(req.body?.data_fim);
    if (!consultor || !inicio || !fim) return res.status(400).json({ sucesso: false, mensagem: 'Informe consultor, data inicial e data final válidos.' });
    if (inicio > fim) return res.status(400).json({ sucesso: false, mensagem: 'A data inicial não pode ser posterior à data final.' });
    if (diferencaMaxima(inicio, fim) > 366) return res.status(400).json({ sucesso: false, mensagem: 'O período máximo permitido é de 366 dias.' });
    res.json(gerarRelatorio(await lerVendas(), consultor, inicio, fim));
  } catch (erro) { next(erro); }
});

function diferencaMaxima(inicio, fim) {
  return Math.round((Date.UTC(fim.getFullYear(), fim.getMonth(), fim.getDate()) - Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) / 86400000);
}
