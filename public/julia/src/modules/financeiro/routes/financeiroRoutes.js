/*DEFINE AS ROTAS DO FINANCEIRO*/

import { Router } from 'express'; /*pega o Router do Express (mini-app para definir rotas)*/
import financeiroController from '../controller/financeiroController.js'; /*importa o financeiroController com os handlers - funções que tratam cada rota/middleware/erro*/

const router = Router(); /*cria uma instância de router que eu uso para "cadastrar" essas rotas*/

router.get('/por-dia', financeiroController.listarPorDia); /*lista valor total por dia (filtro por período, barbeiro, serviço)*/
router.get('/por-barbeiro', financeiroController.listarPorBarbeiro); /*lista valor total por barbeiro*/
router.get('/por-servico', financeiroController.listarPorServico); /*lista valor total por serviço*/
router.get('/exportar/csv', financeiroController.exportarCsv); /*exportar relatório em CSV*/
router.get('/exportar/pdf', financeiroController.exportarPdf); /*exportar relatório em PDF*/

export default router; /*exporta o router para ser montado em /api/financeiro (no app.js)*/