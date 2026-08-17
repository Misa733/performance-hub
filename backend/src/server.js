import 'dotenv/config';
import { criarApp } from './app.js';

const porta = Number(process.env.PORT || 3001);
criarApp().listen(porta, () => console.log(`API disponível na porta ${porta}`));
