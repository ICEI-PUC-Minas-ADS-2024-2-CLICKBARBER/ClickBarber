import express from 'express';
import cors from 'cors';
//importa as funções desses arquivos
import usuariosRoutes from './backend/routes/usuariosRoutes.js'
import barbeariasRoutes from './backend/routes/barbeariasRoutes.js'
import loginRoutes from './backend/routes/loginRoutes.js'

const app = express();
const PORT = 3000;

//permite interpretar requisições em json
app.use(express.json())

//permite requisições de qualquer origem
app.use(cors());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

//rota /usuarios
app.use('/usuarios', usuariosRoutes)
//rota /barbearias
app.use('/barbearias', barbeariasRoutes)
//rota /login
app.use('/login', loginRoutes)

//inicia o servidor
app.listen(PORT, () => {
    console.log('O servidor esta rodando na porta 3000 (http://localhost:3000)')
})