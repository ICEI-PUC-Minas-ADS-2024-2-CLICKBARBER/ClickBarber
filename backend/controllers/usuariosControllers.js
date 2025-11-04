import * as u from '../repositories/usuariosRepositories.js'
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';

//função que pega todos os usuarios
export async function getUsuarios(req , res){
    
    try{
        const data = await u.getAllUsers();

        if(!data)
            return res.status(404).send({message: 'Nenhum usuario encontrado'});

        //filtra a informação pra impedir o envio de dados sensiveis
        const safeUsers = data.map(usuario =>{
            const { id, nome, email} = usuario;
            return { id, nome, email };
        })

        res.status(200).json(safeUsers);
        
    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}

//função que pega o usuario pelo id
export async function getUsuariosById(req , res){
    
    try{
        //pega o id no parametro do request
        const id = req.params.id;

        const data = await u.getUserById(id);

        if(!data)
            return res.status(404).send({message: 'Usuario nao encontrado'});

        //filtra a informação pra impedir o envio de dados sensiveis
        const safeData = {
            id: data.id,
            nome: data.nome,
            email:data.email
        }

        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
    
}

//função que pega o usuario pelo email
export async function getUsuariosByEmail(req , res){
    
    try{
        //pega o email no parametro do request
        const email = req.params.email;

        const data = await u.getUserByEmail(email);

        if(!data)
            return res.status(404).send({message: 'Usuario nao encontrado'});

        //filtra a informação pra impedir o envio de dados sensiveis
        const safeData = {
            id: data.id,
            nome: data.nome,
            email:data.email
        }

        res.status(200).json(safeData);

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que cria um novo usuario
export async function postUsuarios(req , res){
    
    try{
        //pega os dados enviados
        const {email, nome , telefone , cpf ,senha} = req.body;

        //verifica se os dados estão completos
        if(!email || !nome || !telefone || !cpf || cpf.length != 11 || !senha){
            return res.status(400).send({message: 'Dados incompletos'});
        }

        //cria o novo usuario
        const newUser = {
            nome: nome.trim(),
            email : email.trim(),
            telefone: telefone.trim(),
            cpf: cpf.trim(),
            senha: senha.trim()
        }

        if(!await u.createNewUser(newUser)){
            return res.status(500).send({message: 'Erro ao criar usuario'});
        }

        res.status(201).send({message: 'Usuario criado com sucesso'});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que verifica se o email já está cadastrado
export async function verifyEmail(req, res){
    try{
        //pega o email enviado
        const {email} = req.body;

        if(!email)
            return res.status(400).send({message: 'Dados incorretos : Insira o email'});

        const existe = await u.getEmail(email)

        //envia true se o email ja estiver cadastrado e false se não
        return res.status(200).send({
            message: existe ? 'Email encontrado' : 'Email não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que verifica se o cpf já está cadastrado
export async function verifyCpf(req, res){
    try{
        //pega o cpf enviado
        const {cpf} = req.body;

        if(!cpf || cpf.length != 11)
            return res.status(400).send({message: 'Dados incorretos : Insira o cpf'});

        const existe = await u.getCPF(cpf)

        //envia true se o cpf ja estiver cadastrado e false se não
        return res.status(200).send({
            message: existe ? 'CPF encontrado' : 'CPF não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

export async function verifyCpfEmail(req , res){

    const { email , cpf} = req.body;

    if(!cpf || cpf.length != 11 || !email)
        return res.status(400).send({message: "Dados incorretos"});

    try{

        const user = await u.getUserByEmail(email);

        if(!user)
           return res.status(400).send({message: "Dados incorretos"});

        if(user.cpf == cpf){
            const token = jwt.sign(
                //dados que serão salvos no token
                {
                    id: user.id
                },
                //chave do token
                'chave_secreta',
                //tempo até o token expirar
                {expiresIn: '10m'}
            )
            console.log("1")
            return res.status(200).send({
                message: "Credenciais corretas",
                token: token
            })
        }

        return res.status(400).send({message: "Dados incorretos"})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor: ${error} `})
    }

}

//função que atualiza os dados do usuario
export async function putUsuarios(req , res){
    
    const id = req.params.id;
    const dados  = req.body;

    if(!dados.email || !dados.nome || !dados.telefone || !dados.cpf ){
        return res.status(400).send({message: 'Dados incompletos : Insira o email, nome, cpf e telefone'});
    }

    try{

        if(!await u.putUser(id , dados)){
            return res.status(500).send({message: 'Erro ao atualizar usuario'});
        }

        res.status(200).send({message: 'Usuario atualizado com sucesso'});

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

//função que altera a senha do usuario
export async function alteraSenha(req , res){

    //pega o id do user e a nova senha
    const {id} = req.dados;
    const {senha} = req.body;

    if(!senha || !id)
        return res.status(400).send({message: "Credenciais incorretas"});

    try{

        //chama a função que altera a senha
        if(!(await u.patchPassword(id , senha)))
            return res.status(500).send({message: "Ocorreu um erro ao alterar a senha"})

        return res.status(200).send({message: "Senha alterad com sucesso"})

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`})
    }
}

//função que deleta um usuario
export async function deleteUsuarios(req , res){

    //pega o id no parametro do request
    const id = req.params.id;

    try{

        if(!deleteUser(id)){
            return res.status(500).send({message: 'Erro ao excluir usuario'});
        }

        res.status(200).send({message:'Usuario excluido com sucesso'});


    }catch(error){
        return res.status(500).send({message: 'Erro interno do servidor'});
    }
}

