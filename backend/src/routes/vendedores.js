import { Router } from 'express';
import { lerVendas } from '../services/googleSheets.js';
import { normalizarTexto } from '../utils/normalizacao.js';

export const vendedoresRouter = Router();

vendedoresRouter.get('/', async (_req, res, next) => {
  try {
    const unicos = new Map();
    for (const { vendedor } of await lerVendas()) {
      const chave = normalizarTexto(vendedor);
      if (chave && !unicos.has(chave)) unicos.set(chave, vendedor);
    }
    const vendedores = [...unicos.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    res.json({ sucesso: true, quantidade: vendedores.length, vendedores });
  } catch (erro) { next(erro); }
});
