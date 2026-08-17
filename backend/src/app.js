import express from 'express';
import cors from 'cors';
import { vendedoresRouter } from './routes/vendedores.js';
import { relatoriosRouter } from './routes/relatorios.js';

export function criarApp() {
  const app = express();
  const origens = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((v) => v.trim());
  app.use(cors({ origin: (origem, callback) => !origem || origens.includes(origem) ? callback(null, true) : callback(new Error('Origem não permitida pelo CORS.')) }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_req, res) => res.json({ sucesso: true, servico: 'Portal de Desempenho Comercial' }));
  app.use('/api/vendedores', vendedoresRouter);
  app.use('/api/relatorio', relatoriosRouter);
  app.use((_req, res) => res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada.' }));
  app.use((erro, _req, res, _next) => {
    console.error(erro);
    const status = erro.status || (erro.message === 'Origem não permitida pelo CORS.' ? 403 : 500);
    res.status(status).json({ sucesso: false, mensagem: status === 500 ? 'Não foi possível processar a solicitação agora.' : erro.message });
  });
  return app;
}
