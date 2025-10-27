import express from 'express';
//pega as funções do controller de login
import {login , user} from "../controllers/loginControllers.js";
//pega a função que verifica se o token é válido
import {verifyToken} from '../utils/autenticateToken.js';
const routes = express.Router();

//rota que verifica o login
routes.get('/user', verifyToken, user)
//rota que realiza o login
routes.post('/', login);

export default routes;