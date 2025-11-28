import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise'
//importa as funções desses arquivos
import usuariosRoutes from '../../../src/modules/usuarios/routes/usuariosRoutes.js'
import barbeariasRoutes from '../../../src/modules/barbearias/routes/barbeariasRoutes.js'
import loginRoutes from '../../../src/modules/login/routes/loginRoutes.js'
import { pegaLogs } from '../../../src/modules/utils/logs_mware.js';
import { verifyToken } from '../../../src/modules/utils/autenticateToken.js';

const app = express();
const PORT = 3000;

//permite interpretar requisições em json
app.use(express.json())

//permite requisições de qualquer origem
app.use(cors({}));

//pool do banco de ados
export const pool = mysql.createPool({
        host: 'gondola.proxy.rlwy.net',     
        port: 44254,            
        user: 'leo',          
        password: 'senhaDoLeo123',       
        database: 'railway'
    })

    
//rota /usuarios
app.use('/usuarios', usuariosRoutes)
//rota /barbearias
app.use('/barbearias', barbeariasRoutes)
//rota /login
app.use('/login', loginRoutes)
//rota que retorna os logs
app.use('/logs/:valor', verifyToken, pegaLogs)

//inicia o servidor
app.listen(PORT, () => {
    console.log('O servidor esta rodando na porta 3000 (http://localhost:3000)')
})