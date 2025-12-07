import * as a from '../repositories/repositories_agenda.js'

//middleware que retorna todos os agendamentos
export async function getAgendamentos(req, res){
    try{
        const agendamentos = await a.pegaAgendamentos(); //pega os agendamentos dentro do bd

        //verifica se tem algum
        if(agendamentos.length == 0)
            return res.status(404).send({message: 'Nenhum agendamento encontrado'})

        //se tiver envia todos como resposta
        return res.status(200).send({message: "Agendamento encontrados com sucesso" , data: agendamentos})
    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
};

//middleware que retorna apenas 1 agendamentos
export async function getAgendamento(req, res) {
    const {id} = req.params; //pega o id no parametro da url

    //verifica se ele existe
    if(!id)
        return res.status(400).send({message: 'ID do agendamento é obrigatório'})

    try{
        const agendamento = await a.pegaAgendamento(id); //pega o agendamento dentro do bd

        //verifica se ele existe
        if(!agendamento)
            return res.status(404).send({message: 'Agendamento não encontrado'})

        //se exister retorna ele como resposta
        return res.status(200).send({message: 'Agendamento encontrado com sucesso', data: agendamento})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
};

//middleware que cadastra um agendamento
export async function postAgendamento (req, res){
    const { barbeiro_id, cliente, servico_id, horario, data } = req.body; //pega os dados no body da requisição

    //verifica se todos os dados foram enviados
    if(!barbeiro_id || !cliente || !servico_id || !horario || !data)
        return res.status(400).send({message: 'Dados incorretos ou incompletos'})

    try{
        //verifica se o id do barbeiro é valido
        if(!(await a.verificaDado(barbeiro_id , 'Pessoa', 'ID_pessoa')))
            return res.status(404).send({message: 'Barbeiro não encontrado'})
        //verifica se o id do serviço é válido
        if(!(await a.verificaDado(servico_id , 'Servico', 'ID_servico')))
            return res.status(404).send({message: 'Serviço não encontrado'})

        //cria um objeto contendo os dados enviados
        const novo = {
            barbeiro_id: barbeiro_id,
            cliente: cliente,
            servico_id: servico_id,
            horario: horario,
            data: data,
        };

        //verifica se o agendamento foi cadastrado no bd
        if(!(await a.criaAgendamento(novo)))
            return res.status(500).send({message: 'Não foi possível criar o agendamento'})

        return res.status(201).send({message: 'Agendamento criado com sucesso'})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor ${error}`})
    }
};

//middleware que altera um agendamento
export async function patchAgendamento (req, res){
    const {id} = req.params; //pega o id no parametro da url
    const { data, horario } = req.body; //pega a data e o horario enviados

    //verifica se todos os dados foram enviados
    if(!data || !horario || !id)
            return res.status(400).send({message: 'Dados incorretos ou incompletos'})

    try{
        //verifica se o agendamento foi alterado dentro do banco de dados
        if(!(await a.alteraAgendamento(id, data, horario)))
            return res.status(400).send({message: 'Não foi possível alterar o agendamento, verifique se o id ou os dados enviados estão corretos'})

        return res.status(200).send({message: 'Agendamento alterado com sucesso'})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
};

//middleware que deleta um agendamento
export async function deleteAgendamento (req, res){
    const {id} = req.params; //pega o id no parametro da url

    //verifica se o id foi enviado
    if(!id)
        return res.status(400).send({message: 'ID do agendamento é obrigatório'})

    try{
        //verifica se o agendamento foi deletado dentro do banco de dados
        if(!(await a.excluiAgendamento(id)))
            return res.status(400).send({message: 'Não foi possível deletar o agendamento, verifique se o id esta correto'})

        return res.status(200).send({message: 'Agendamento deletado com sucesso'})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
};

//middleware que retorna todos os barbeiros
export async function getBarbeiros(req, res){
    try{
        const barbeiros = await a.pegaBarbeiros(); //pega os barbeiros dentro do bd

        //verifica se existe algum barbeiro cadastrado
        if(barbeiros.length <1)
            return res.status(404).send({message: 'Nenhum barbeiro encontrado'})

        return res.status(200).send({message: "Barbeiros encontrados com sucesso" , data: barbeiros})
    }catch(error){
        return res.status(500).send({message: 'Erro interno do servidor'})
    }
}

//middleware que retorna todos os serviços
export async function getServicos(req, res){
    try{
        const servicos = await a.pegaServicos(); //pega os serviços dentro do bd

        //verifica se existe algum serviço cadastrado
        if(servicos.length <1)
            return res.status(404).send({message: 'Nenhum servico encontrado'})

        return res.status(200).send({message: "Servicos encontrados com sucesso" , data: servicos})
    }catch(error){
        return res.status(500).send({message: 'Erro interno do servidor'})
    }
}