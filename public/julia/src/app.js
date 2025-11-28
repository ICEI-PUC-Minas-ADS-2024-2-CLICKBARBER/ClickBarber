/*CONFIGURANDO A API E EXPORTANDO*/

/*importando "pacotes"*/
import express from 'express'; /*biblioteca que cria o servidor http*/
import cors from 'cors'; /*habilita requisições vindas de outros domínios (ex: front rodando em outra porta/host)*/
import morgan from 'morgan'; /*faz logs -registros de eventos que o sistema escreve enquanto roda- de cada requisição (método, URL, tempo, status)*/
import produtosRouter from './modules/produtos/routes/produtoRoutes.js'; /*conjunto de rotas do módulo de produtos*/
import financeiroRouter from './modules/financeiro/routes/financeiroRoutes.js'; /*conjunto de rotas do módulo financeiro*/
import mysql from 'mysql2/promise'; /*para dar SELECT, INSERT, etc. no banco diretamente pelo Node*/
import { loadEnv } from './config/env.js'; /*lê o .env (informações do banco de dados)*/

/*pool de conexões com o BD*/
const env = loadEnv();

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined
});

/*cria a aplicação*/
export const app = express(); /*instancia o app do Express e o exporta, permitindo que outro arquivo (ex.: server.js) ligue o servidor e também facilita testes*/

/*middlewares globais (funções que rodam para toda requisição, em todas as rotas)*/
app.use(cors()); /*habilita CORS com configuração padrão (aceita qualquer origem). Útil pra o meu front em http://localhost:3000 falar com a API*/
app.use(express.json({ limit: '10mb' })); /*ativa o parser -pega o texto do corpo da requisição e transforma em objeto js- de JSON no corpo da requisição e impede payloads -conteúdo que viaja na requisição ou resposta- acimda de 10mb*/
app.use(morgan('dev')); /*registros automáticos no console a cada requisição*/

/*rotas de aplicação*/
app.use('/api/produtos', produtosRouter); /*tudo que produtosRouter expõe fica acessível a partir de /api/produtos*/
app.use('/api/financeiro', financeiroRouter); /*tudo que financeiroRouter expõe fica acessível a partir de /api/financeiro*/

/*API de serviços para popular o select:*/
app.get('/api/servicos', async (req, res) => { /*rota do tipo GET*/
  try {
    const [rows] = await pool.query('SELECT ID_servico AS id, Titulo AS nome FROM Servico ORDER BY Titulo'); /*faz a consulta no MySQL, pega todos os registros da tabela Serviço ordenados pelo campo ID_servico*/
    res.json(rows); /*envia a lista de serviços em JSON pro front*/
  } catch (err) { /*se der algum erro no pool.query*/
    console.error('Erro em GET /api/servicos:', err);
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
});

app.get('/api/servicos/:id', async (req, res) => { /*cria uma rota com parâmetro na URL*/
  try {
    const [rows] = await pool.query( /*faz uma consulta procurando apenas o serviço com o ID da url*/
      'SELECT * FROM Servico WHERE ID_servico = ?',
      [req.params.id] /*o valor do ID na url*/
    );
    if (!rows[0]) { /*significa que não existe nenhum serviço com esse ID*/
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }
    res.json(rows[0]); /*se achou, devolve somente o serviço encontrado*/
  } catch (err) { /*se der erro no banco*/
    console.error('Erro em GET /api/servicos/:id', err);
    res.status(500).json({ erro: 'Erro ao buscar serviço' });
  }
});

/*se nenhuma rota anterior atendeu a requisição (não foi mapeada), retorna HTTP 404*/
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

/*trata erros lançados nas rotas/middlewares, respondendo com o err.status ou 500*/
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

