import * as b from '../repository/barbeariasRepositories.js';
//importa a função que pega os dados através do cep enviado
import {pegaDadosCep} from '../../utils/getCep.js'

//pega todas as barbearias
export async function getBarbershops(req, res){

    try{
        const data = await b.getAllBarbearias();

        if(data.length <= 0)
            return res.status(404).send({message: 'Nenhuma barbearia encontrada'})

        //filtra as informações de cada barbearia pra impedir o envio de dados sensiveis
        const safeBarberarias = data.map(barbearia =>{
            return {
                nome: barbearia.Nome,
                email: barbearia.email,
                cidade : barbearia.Cidade_endereco ,  
                bairro :barbearia.Bairro_endereco , 
                rua : barbearia.Rua_endereco , 
                numero :barbearia.Numero_endereco
            };
        })
        res.status(200).json(safeBarberarias);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}

//função que pega a barbearia por CNPJ
export async function getBarbershopByCnpj(req, res){
    try{
        //pega o cnpj no parametro do request
        const cnpj = req.params.cnpj;
        const data = await b.getBarbeariaByCNPJ(cnpj);

        if(data.length <= 0)
            return res.status(404).send({message: `Barbearia não encontrada`});

        //filtra a informação pra impedir o envio de dados sensiveis
        const safeData = {
            nome: data.Nome,
            email: data.email,
            cidade : data.Cidade_endereco ,  
            bairro :data.Bairro_endereco , 
            rua : data.Rua_endereco , 
            numero :data.Numero_endereco
        }
        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message:`Erro interno do servidor`})
    }
}

//pega a barbearia pelo email
export async function getBarbershopByEmail(req, res){
    try{
        //pega o email no parametro do request
        const email = req.params.email;

        const data = await b.getBarbeariasByEmail(email);

        if(data.length <= 0)
            return res.status(404).send({message: 'Barbearia não encontrada'});

        //filtra a informação pra impedir o envio de dados sensiveis
        const safeData = {
            nome: data.Nome,
            email: data.email,
            cidade : data.Cidade_endereco ,  
            bairro :data.Bairro_endereco , 
            rua : data.Rua_endereco , 
            numero :data.Numero_endereco
        }
        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que cria uma nova barbearia
export async function createBarbershop(req, res){
    try{
        //pega os dados enviados
        let dados = req.body;

        //verifica se os dados estão completos
        if(!dados.email || !dados.nome || dados.telefone.length!=10 || dados.cnpj.length != 14 || !dados.senha || dados.cep.length!=8 || !dados.num)
            return res.status(400).send({message: 'Dados incompletos'});

        //chama a função que pega os dados através do cep
        const dadosCep = await pegaDadosCep(dados.cep);

        //verifica se o cep é válido
        if(!dadosCep)
            return res.status(400).send({message : 'CEP inválido'})

        //adiciona os dados do cep aos dados enviados pelo usuário
        dados = {
            ...dados,
            ...dadosCep
        }
        
        //chama a função que cria a barbearia no repositories
        if(!await b.createNewBarbearia(dados))
            return res.status(500).send({message: `Não foi possivel criar um novo usuario`})

        res.status(201).send({message: `Barbearia criada com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do sistema: ${error}`});
    }
}

//função que verifica se o email ja foi cadastrado
export async function verifyEmail(req, res){
    try{
        //pega o email enviado
        const {email} = req.body;

        if(!email)
            return res.status(400).send({message: 'Dados incorretos : Insira o email'});

        //chama a função que verifica se ele existe no banco de dados
        const existe = await b.getEmail(email)

        //envia true se o email ja estiver cadastrado e false se não
        return res.status(200).send({
            message: existe ? 'Email encontrado' : 'Email não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que verifica se o cnpj ja foi cadastrado
export async function verifyCnpj(req, res){
    try{
        //pega o cnpj enviado
        const {cnpj} = req.body;

        //valida o cnpj
        if(!cnpj || cnpj.length != 14)
            return res.status(400).send({message: 'Dados incorretos : Insira o cnpj'});

        const existe = await b.getCNPJ(cnpj)

        //envia true se o cnpj ja estiver cadastrado e false se não
        return res.status(200).send({
            message: existe ? 'CNPJ encontrado' : 'CNPJ não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que atualiza os dados da barbearia
export async function putBarbershop(req,res){
    try{
        const cnpj = req.params.cnpj;
        const dados = req.body;

        if(!dados.email || !dados.nome || !dados.telefone || dados.cep.length != 8 || !dados.num)
            return res.status(400).send({message: 'Dados incompletos'});

         //chama a função que pega os dados através do cep
        const dadosCep= await pegaDadosCep(dados.cep);

        //verifica se o cep é válido
        if(!dadosCep)
            return res.status(400).send({message : 'CEP inválido'})

        //adiciona os dados do cep aos dados enviados pelo usuário
        dados = {
            ...dados,
            ...dadosCep
        }

        //tenta atualizar os dados
        if(!await b.putBarbearia(cnpj, dados))
            return res.status(500).send({message: `Não foi possivel atualizar os dados da barbearia`})
        
        res.status(200).send({message:`Dados da barbearia atualizados com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
}

//função que deleta a barbearia
export async function deleteBarbershop(req, res){
    try{
        //pega o id no parametro do request
        const cnpj = req.params.cnpj;

        //chama a função que deleta a barbearia no repositories
        if(!await b.createNewBarbearia(cnpj))
            return res.status(500).send({message: `Não foi possivel deletar a barbearia`});

        res.status(200).send({message: `Barbearia deletada com sucesso`});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}

