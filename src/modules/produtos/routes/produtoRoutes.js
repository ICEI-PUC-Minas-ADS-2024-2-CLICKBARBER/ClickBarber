/*DEFINE AS ROTAS REST DE PRODUTOS*/

import { Router } from 'express'; /*pega o Router do Express (mini-app para definir rotas)*/
import c from '../controller/produtoController.js'; /*importa o controller (c) com os handlers - funções que tratam cada rota/middleware/erro*/

const router = Router(); /*cria uma instância de router*/

router.get('/', c.list); /*lista produtos (aceita filtros via query string)*/
router.get('/categorias', c.categorias); /*retorna categorias (sem duplicadas)*/
router.get('/:id', c.get); /*busca um produto pelo id*/
router.post('/', c.create); /*cria um novo produto (usa o body JSON)*/
router.put('/:id', c.update); /*atualiza o produto pelo id (body JSON)*/
router.delete('/:id', c.remove); /*remove o produto pelo id*/

export default router; /*exporta o router para ser montado em /api/produtos (no app.js)*/