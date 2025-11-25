/*CONFIGURANDO A API E EXPORTANDO*/

/*importando "pacotes"*/
import express from 'express'; /*biblioteca que cria o servidor http*/
import cors from 'cors'; /*habilita requisições vindas de outros domínios (ex: front rodando em outra porta/host)*/
import morgan from 'morgan'; /*faz logs -registros de eventos que o sistema escreve enquanto roda- de cada requisição (método, URL, tempo, status)*/
import produtosRouter from './modules/produtos/routes/produtoRoutes.js'; /*conjunto de rotas do módulo de produtos*/
import financeiroRouter from './modules/financeiro/routes/financeiroRoutes.js'; /*conjunto de rotas do módulo financeiro*/

/*cria a aplicação*/
export const app = express(); /*instancia o app do Express e o exporta, permitindo que outro arquivo (ex.: server.js) ligue o servidor e também facilita testes*/

/*middlewares globais (funções que rodam para toda requisição, em todas as rotas)*/
app.use(cors()); /*habilita CORS com configuração padrão (aceita qualquer origem). Útil pra o meu front em http://localhost:3000 falar com a API*/
app.use(express.json({ limit: '10mb' })); /*ativa o parser -pega o texto do corpo da requisição e transforma em objeto js- de JSON no corpo da requisição e impede payloads -conteúdo que viaja na requisição ou resposta- acimda de 10mb*/
app.use(morgan('dev')); /*registros automáticos no console a cada requisição*/

/*rotas de aplicação*/
app.use('/api/produtos', produtosRouter); /*tudo que produtosRouter expõe fica acessível a partir de /api/produtos*/
app.use('/api/financeiro', financeiroRouter); /*tudo que financeiroRouter expõe fica acessível a partir de /api/financeiro*/

/*se nenhuma rota anterior atendeu a requisição (não foi mapeada), retorna HTTP 404*/
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

/*trata erros lançados nas rotas/middlewares, respondendo com o err.status ou 500*/
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

