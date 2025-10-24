import express from 'express';
import cors from 'cors';
import usuariosRoutes from './backend/routes/usuariosRoutes.js'
import barbeariasRoutes from './backend/routes/barbeariasRoutes.js'
import loginRoutes from './backend/routes/loginRoutes.js'

const app = express();
const PORT = 3000;

app.use(express.json())

app.use(cors());

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

app.use('/usuarios', usuariosRoutes)
app.use('/barbearias', barbeariasRoutes)
app.use('/login', loginRoutes)


app.listen(PORT, () => {
    console.log('O servidor esta rodando na porta 3000 (http://localhost:3000)')
})