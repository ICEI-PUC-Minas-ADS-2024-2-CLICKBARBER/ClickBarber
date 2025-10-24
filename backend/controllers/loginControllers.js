import {readDB} from '../utils/fileReader.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(req, res){

    try{

        const {email, senha }= req.body;

        if(!email || !senha)
            return res.status(401).send({message:"Credenciais invalidas"})

        const data = await readDB();

        if(!data.usuarios)
            return res.status(401).send({message: 'Credenciais inválidas'});

        const user = data.usuarios.find(u => u.email === email);

        if(!user)
            return res.status(401).send({message: 'Credenciais invalidas'})

        if(!await bcrypt.compare(senha, user.senha))
            return res.status(401).send({message: 'Credenciais invalidas'})

        const token = jwt.sign(
            {
                id: user.id,
                name: user.nome,
                email: user.email       
            },
            'chave_secreta',
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

export async function user (req, res){
    const user = req.user;

    res.json({
        id:user.id,
        email:user.email,
        nome:user.nome
    })
}