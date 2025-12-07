import express from 'express';
import * as a from '../controllers/controller_agenda.js';
const router = express.Router();

//rotas do tipo GET
router.get('/', a.getAgendamentos)
router.get('/:id', a.getAgendamento)
//rotas do tipo POST
router.post('/', a.postAgendamento)
//rotas do tipo PATCH
router.patch('/:id', a.patchAgendamento)
//rotas do tipo DELETE
router.delete('/:id', a.deleteAgendamento)

export default router;