import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
//import das funções usadas nas rotas
import router from './routes/routes_agenda.js';
import {getServicos, getBarbeiros} from './controllers/controller_agenda.js'; 


const app = express();
app.use(cors());
app.use(express.json());

//pool do banco de ados
export const pool = mysql.createPool({
        host: 'gondola.proxy.rlwy.net',     
        port: 44254,            
        user: 'noemi',          
        password: 'senhadaNoemi123',       
        database: 'railway'
    })

app.use('/agendar', router) //rotas envolvendo os agendamento
app.use('/servicos', getServicos) //rotas que retorna todos os serviços cadastrados
app.use('/barbeiros', getBarbeiros) //rotas que retorna todos os barbeiros cadastrados

const PORT = 3000;

app.listen(PORT, ()=>{
    console.log(`Servidor rodando na porta ${PORT}`);
})
