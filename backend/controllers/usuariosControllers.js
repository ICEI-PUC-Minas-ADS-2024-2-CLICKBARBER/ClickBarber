import * as u from '../repositories/usuariosRepositories.js'

export async function getUsuarios(req , res){
    
    try{
        const data = await u.getAllUsers();

        if(!data)
            return res.status(404).send({message: 'Nenhum usuario encontrado'});

        const safeUsers = data.map(usuario =>{
            const { id, nome, email} = usuario;
            return { id, nome, email };
        })

        res.status(200).json(safeUsers);
        
    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor`});
    }
}
export async function getUsuariosById(req , res){
    
    try{
        const id = req.params.id;

        const data = await u.getUserById(id);

        if(!data)
            return res.status(404).send({message: 'Usuario nao encontrado'});

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
export async function getUsuariosByEmail(req , res){
    
    try{
        const email = req.params.email;

        const data = await u.getUserByEmail(email);

        if(!data)
            return res.status(404).send({message: 'Usuario nao encontrado'});

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

export async function postUsuarios(req , res){
    
    try{
        const {email, nome , telefone , cpf ,senha} = req.body;

        if(!email || !nome || !telefone || !cpf || !senha){
            return res.status(400).send({message: 'Dados incompletos'});
        }

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

export async function verifyEmail(req, res){
    try{
        const {email} = req.body;

        if(!email)
            return res.status(400).send({message: 'Dados incorretos : Insira o email'});

        const existe = await u.getEmail(email)

        return res.status(200).send({
            message: existe ? 'Email encontrado' : 'Email não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

export async function verifyCpf(req, res){
    try{
        const {cpf} = req.body;

        if(!cpf || cpf.length != 11)
            return res.status(400).send({message: 'Dados incorretos : Insira o cpf'});

        const existe = await u.getCPF(cpf)

        return res.status(200).send({
            message: existe ? 'CPF encontrado' : 'CPF não encontrado',
            cadastrado: existe
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}

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



export async function deleteUsuarios(req , res){

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

