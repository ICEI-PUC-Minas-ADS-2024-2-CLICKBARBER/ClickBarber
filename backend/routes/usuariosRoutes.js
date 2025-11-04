import express from 'express';
//pega as funções do controller de usuarios
import * as usuarios from '../controllers/usuariosControllers.js'
import { verifyToken } from '../utils/autenticateToken.js';
const routes = express.Router();

//rotas de GET
routes.get('/', usuarios.getUsuarios)
routes.get('/:id', usuarios.getUsuariosById)
routes.get('/email/:email', usuarios.getUsuariosByEmail)
//rotas de POST
routes.post('/', usuarios.postUsuarios)
//rotas de verificação
routes.post('/email', usuarios.verifyEmail)
routes.post('/cpf', usuarios.verifyCpf)
routes.post('/cpf-email', usuarios.verifyCpfEmail)
//rotas de PUT/PATCH
routes.put('/:id', usuarios.putUsuarios)
routes.patch('/senha', verifyToken , usuarios.alteraSenha)
//rotas de DELETE
routes.delete('/:id', usuarios.deleteUsuarios)

export default routes;