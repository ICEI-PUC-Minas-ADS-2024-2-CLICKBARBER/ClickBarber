import express from 'express';
import * as usuarios from '../controllers/usuariosControllers.js'
const routes = express.Router();

routes.get('/', usuarios.getUsuarios)
routes.get('/:id', usuarios.getUsuariosById)
routes.get('/email/:email', usuarios.getUsuariosByEmail)
routes.post('/', usuarios.postUsuarios)
routes.post('/email', usuarios.verifyEmail)
routes.post('/cpf', usuarios.verifyCpf)
routes.put('/:id', usuarios.putUsuarios)
routes.delete('/:id', usuarios.deleteUsuarios)

export default routes;