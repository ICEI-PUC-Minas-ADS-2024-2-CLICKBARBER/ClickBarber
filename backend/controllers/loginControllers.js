import {readDB} from '../utils/fileReader.js';
//importa o bcrypt para comparar a senha
import bcrypt from 'bcrypt';
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';


//função que realiza o login
export async function login(req, res){

    try{
        //pega o email e a senha enviados
        const {email, senha }= req.body;

        //verifica se eles estão completos
        if(!email || !senha)
            return res.status(401).send({message:"Credenciais invalidas"})

        //pega as informações do banco de dados
        const data = await readDB();

        //verifica se existe algum usuarios cadastrado
        if(!data.usuarios)
            return res.status(401).send({message: 'Credenciais inválidas'});

        //procura o usuario pelo email enviado
        const user = data.usuarios.find(u => u.email === email);

        //verifica se ele existe
        if(!user)
            return res.status(401).send({message: 'Credenciais invalidas'})

        //compara a senha enviada com a senha cadastrado no banco de dados
        if(!await bcrypt.compare(senha, user.senha))
            return res.status(401).send({message: 'Credenciais invalidas'})

        //se a senha estiver correta cria o token jwt
        const token = jwt.sign(
            //dados que serão salvos no token
            {
                id: user.id,
                name: user.nome,
                email: user.email       
            },
            //chave do token
            'chave_secreta',
            //tempo até o token expirar
            {expiresIn: '7d'}
        )

        res.status(200).json({
            message:"Login realizado com sucesso",
            token: token
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor: ${error}`})
    }
}

//função que retorna os dados do usuario que esta logado
export async function user (req, res){
    const user = req.user;

    res.json({
        id:user.id,
        email:user.email,
        nome:user.nome
    })
}