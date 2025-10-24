import express from 'express';
import {login , user} from "../controllers/loginControllers.js";
import {verifyToken} from '../utils/autenticateToken.js';
const routes = express.Router();

routes.get('/user', verifyToken, user)
routes.post('/', login);

export default routes;