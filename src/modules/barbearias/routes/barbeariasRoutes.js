import express from 'express';
//pega as funções do controller de barbearias
import * as barbearias from '../controller/barbeariasControllers.js'
import { verifyToken } from '../../utils/autenticateToken.js';
//cria o roteador
const routes = express.Router();

//rotas de GET
routes.get('/', barbearias.getBarbershops);
routes.get('/:cnpj', barbearias.getBarbershopByCnpj)
routes.get('/email/:email', barbearias.getBarbershopByEmail);
//rotas de POST
routes.post('/', barbearias.createBarbershop);
//rotas de verificação
routes.post('/authLogs', verifyToken , barbearias.authLogs)
routes.post('/email', barbearias.verifyEmail)
routes.post('/cnpj', barbearias.verifyCnpj)
//rotas de PUT
routes.put('/:cnpj', barbearias.putBarbershop);
//rotas de DELETE
routes.delete('/:cnpj', barbearias.deleteBarbershop);

export default routes;