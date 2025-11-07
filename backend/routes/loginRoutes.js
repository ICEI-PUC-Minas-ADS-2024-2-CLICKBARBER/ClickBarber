import express from 'express';
//pega as funções do controller de login
import {loginU} from "../controllers/loginUControllers.js";
import {loginB} from "../controllers/loginBControllers.js";
//pega a função que verifica se o token é válido
import {verifyToken} from '../utils/autenticateToken.js';

const routes = express.Router();

//rota que verifica o login
routes.get('/verify', verifyToken)
//rota que realiza o login do usuario
routes.post('/usuarios', loginU);
//rota que realiza o login da barbearia
routes.post('/barbearia', loginB);

export default routes;