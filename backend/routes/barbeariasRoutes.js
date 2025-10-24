import express from 'express';
import * as barbearias from '../controllers/barbeariasControllers.js'
const routes = express.Router();

routes.get('/', barbearias.getBarbershops);
routes.get('/:id', barbearias.getBarbershopById)
routes.get('/email/:email', barbearias.getBarbershopByEmail);
routes.post('/', barbearias.createBarbershop);
routes.post('/email', barbearias.verifyEmail)
routes.post('/cnpj', barbearias.verifyCnpj)
routes.put('/:id', barbearias.putBarbershop);
routes.delete('/:id', barbearias.deleteBarbershop);

export default routes;