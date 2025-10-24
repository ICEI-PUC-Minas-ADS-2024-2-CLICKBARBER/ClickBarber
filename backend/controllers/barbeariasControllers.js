import * as b from '../repositories/barbeariasRepositories.js';

export async function getBarbershops(req, res){

    try{
        const data = await b.getAllBarbearias();

        if(!data)
            return res.status(404).send({message: 'Nenhuma barbearia encontrada'})

        const safeBarberarias = data.map(barbearia =>{
            const {id, nome, email} = barbearia;
            return {id, nome, email};
        })

        res.status(200).json(safeBarberarias);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}

export async function getBarbershopById(req, res){
    try{
        const id = req.params.id;
        const data = await b.getBarbeariaById(id);

        if(!data)
            return res.status(404).send({message: `Barbearia não encontrada`});

        const safeData = {
            id: data.id,
            nome: data.nome,
            email: data.email
        }

        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message:`Erro interno do servidor`})
    }
}

export async function getBarbershopByEmail(req, res){
    try{
        const email = req.params.email;

        const data = await b.getBarbeariasByEmail(email);

        if(!data)
            return res.status(404).send({message: 'Barbearia não encontrada'});

        const safeData = {
            id: data.id,
            nome: data.nome,
            email: data.email
        }

        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

export async function createBarbershop(req, res){
    try{
        const dados = req.body;

        if(!dados.email || !dados.nome || !dados.telefone || !dados.cnpj || !dados.senha)
            return res.status(400).send({message: 'Dados incompletos'});
        

        if(!await b.createNewBarbearia(dados))
            return res.status(500).send({message: `Não foi possivel criar um novo usuario`})

        res.status(201).send({message: `Barbearia criada com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do sistema: ${error}`});
    }
}

export async function verifyEmail(req, res){
    try{
        const {email} = req.body;

        if(!email)
            return res.status(400).send({message: 'Dados incorretos : Insira o email'});

        const existe = await b.getEmail(email)

        return res.status(200).send({
            message: existe ? 'Email encontrado' : 'Email não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

export async function verifyCnpj(req, res){
    try{
        const {cnpj} = req.body;

        if(!cnpj || cnpj.length != 14)
            return res.status(400).send({message: 'Dados incorretos : Insira o cnpj'});

        const existe = await b.getCNPJ(cnpj)

        return res.status(200).send({
            message: existe ? 'CNPJ encontrado' : 'CNPJ não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

export async function putBarbershop(req,res){
    try{
        const id = req.params.id;
        const dados = req.body;

        if(!dados.email || !dados.nome || !dados.telefone)
            return res.status(400).send({message: 'Dados incompletos'});

        if(!await b.putBarbearia(id, dados))
            return res.status(500).send({message: `Não foi possivel atualizar os dados da barbearia`})
        
        res.status(200).send({message:`Dados da barbearia atualizados com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
}

export async function deleteBarbershop(req, res){
    try{
        const id = req.params.id;

        if(!await b.createNewBarbearia(id))
            return res.status(500).send({message: `Não foi possivel deletar a barbearia`});

        res.status(200).send({message: `Barbearia deletada com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}