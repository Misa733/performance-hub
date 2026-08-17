# Portal de Desempenho Comercial

Aplicação React + Node.js que transforma registros do Google Sheets em relatórios comerciais. A integração é direta com a Google Sheets API: **não há n8n nem banco SQL**.

## Estrutura

```text
frontend/  React + Vite, interface e impressão
backend/   Express, Google Sheets, cache e regras do relatório
```

O navegador chama a API REST. Somente o backend conhece as credenciais do Google. A leitura busca as colunas A:L em uma única requisição e mantém o resultado em cache por 60 segundos (configurável).

## Executar localmente

Requer Node.js 20 ou superior.

1. Na raiz, instale as dependências com `npm install`.
2. Copie `backend/.env.example` para `backend/.env` e preencha os dados do Google.
3. Se necessário, copie `frontend/.env.example` para `frontend/.env`.
4. Execute `npm run dev` na raiz.
5. Abra `http://localhost:5173`. A API roda em `http://localhost:3001`.

O frontend usa `frontend/.env` com `VITE_API_URL=http://localhost:3001`. Reinicie o Vite sempre que alterar esse arquivo. A porta 5173 é estrita: se já estiver ocupada, o Vite informa o conflito em vez de iniciar silenciosamente em outra porta e provocar erro de CORS ou abrir uma instância antiga.

Na inicialização, a lista de vendedores tenta novamente por alguns segundos caso o frontend fique pronto antes da API. A promessa da consulta é compartilhada para evitar a chamada duplicada causada pelo `StrictMode` do React em desenvolvimento.

O backend local roda sem o modo `--watch`, pois observadores de arquivos podem reiniciar processos indevidamente em pastas sincronizadas pelo OneDrive. Depois de alterar código do backend, reinicie `npm run dev`. Se um dos dois serviços falhar, o comando encerra o conjunto em vez de deixar o frontend aberto apontando para uma API desligada.

O formulário abre com o período do primeiro dia do mês atual até hoje. As datas podem ser alteradas antes de gerar o relatório.

Outros comandos:

```bash
npm test       # testes das regras principais
npm run build  # build de produção do frontend
```

## Configurar a Google Sheets API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/), crie ou selecione um projeto.
2. Em **APIs e serviços > Biblioteca**, procure **Google Sheets API** e habilite-a.
3. Em **IAM e administrador > Contas de serviço**, crie uma Service Account. Não é necessário atribuir um papel amplo ao projeto.
4. Abra a conta criada, acesse **Chaves > Adicionar chave > Criar nova chave > JSON** e baixe o arquivo uma única vez.
5. Na planilha, clique em **Compartilhar** e conceda acesso de **Leitor** ao e-mail `client_email` da Service Account.
6. O ID da planilha é o trecho entre `/d/` e `/edit` na URL.

Preencha `backend/.env`:

```dotenv
GOOGLE_PROJECT_ID=projeto-do-google
GOOGLE_CLIENT_EMAIL=conta@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=id_da_planilha
GOOGLE_SHEET_NAME=Respostas ao formulário 1
PORT=3001
CORS_ORIGIN=http://localhost:5173
CACHE_TTL_SECONDS=60
```

Mantenha as aspas e os caracteres `\n` da chave. O backend os converte em quebras de linha. Nunca coloque o JSON ou qualquer credencial no frontend, no Git ou em variáveis `VITE_*`.

## API

### `GET /api/vendedores`

Retorna vendedores únicos da coluna `VENDEDOR`, ordenados. A comparação ignora caixa, acentos e espaços extras, mas a primeira grafia encontrada é preservada para exibição.

### `POST /api/relatorio`

```json
{
  "consultor": "BRUNA RAISSA PEREIRA GONÇALVES",
  "data_inicio": "2026-08-01",
  "data_fim": "2026-08-14"
}
```

As datas da API são estritamente `YYYY-MM-DD`; as datas da planilha são lidas como `DD/MM/YYYY`, inclusive quando têm horário depois da data. Os parsers criam datas locais ao meio-dia e os cálculos de duração usam UTC civil, evitando mudanças de dia por timezone ou horário de verão.

Há também `GET /api/health` para monitoramento. O período máximo aceito é 366 dias, protegendo o serviço contra consultas acidentais excessivas.

## Regras adotadas

- O consultor é sempre identificado por `VENDEDOR`; a coluna `CONSULTOR` não é usada.
- Cabeçalhos são normalizados no backend. Assim, `Produto Adquirido ` e `Produto Adquirido` produzem a mesma chave.
- CPF permanece texto. Pontuação é removida somente para comparação; não há conversão numérica, evitando perda de zeros à esquerda.
- A deduplicação usa vendedor + CPF + data + produto; sem CPF, usa vendedor + nome + data + produto. Textos da chave ignoram caixa, acentos e espaços extras.
- O total de clientes usa CPF normalizado ou, se vazio, nome normalizado.
- Período dentro de um único mês compara os mesmos dias do mês anterior. Se o dia não existir no mês anterior (por exemplo, dia 31), usa-se o último dia daquele mês. Períodos que atravessam meses comparam a janela imediatamente anterior, inclusiva e com a mesma quantidade de dias.
- Sem vendas anteriores, a variação é `null` e a tendência é `SEM COMPARAÇÃO`.
- A meta fixa fica em `backend/src/config.js`. Ela aparece apenas quando o período começa no dia 1 e termina no mesmo mês.
- Se o mês terminou e ainda faltam vendas, `ritmo_necessario_vendas_dia` é `null`, pois não há dias disponíveis.
- Produto vazio é agrupado como `NÃO INFORMADO`, para que uma venda válida não desapareça do mix.
- O cache é compartilhado pelos dois endpoints e expira por tempo; nenhuma consulta é feita por linha.

## Publicação

### Frontend na Vercel

Importe o repositório, defina o diretório raiz como `frontend`, use `npm run build`, saída `dist`, e configure:

```dotenv
VITE_API_URL=https://sua-api.exemplo.com
```

### Backend no Render ou Railway

Defina o diretório raiz como `backend`, comando de instalação `npm install` e inicialização `npm start`. Cadastre todas as variáveis do `backend/.env.example` no painel. Em produção:

```dotenv
CORS_ORIGIN=https://seu-frontend.vercel.app
```

Mais de uma origem pode ser informada separada por vírgulas. Nunca faça commit do `.env`. No Render gratuito, a primeira chamada após inatividade pode demorar enquanto o serviço inicia.

## Evolução para cadastro de vendas

Uma futura rota `POST /api/vendas` pode ser adicionada em `backend/src/routes/`, com um serviço de escrita separado em `backend/src/services/`. Para isso, o escopo Google muda de somente leitura para escrita, a planilha deve ser compartilhada como Editor e o cache deve ser invalidado após inserir a linha. A interface de cadastro não foi implementada nesta versão.

## Checklist de manutenção

- Rode `npm test` após alterar datas, deduplicação, meta ou comparação.
- Confirme se a aba continua com as colunas A:L e com os cabeçalhos esperados.
- Ajuste `META_MENSAL` em `backend/src/config.js` quando necessário.
- Use o botão **Imprimir / Salvar PDF**; o CSS de impressão remove filtros e navegação e preserva os blocos do relatório.
