//importa a pool do banco de dados
import { pool } from '../../../index.js';
//importa o bcrypt para comparar a senha
import bcrypt from 'bcrypt';
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';


//função que realiza o login
export async function loginU(req, res){

    try{
        //pega o email e a senha enviados
        const {email, senha }= req.body;

        //verifica se eles estão completos
        if(!email || !senha)
            return res.status(401).send({message:"Credenciais incorretas"})

        //pega as informações do banco de dados
        const [rows] = await pool.execute('select * from Pessoa where E_mail = ?' ,[email])

        //verifica se existe algum usuarios cadastrado
        if(!rows[0])
            return res.status(401).send({message: 'Credenciais incorretas'});

        //compara a senha enviada com a senha cadastrado no banco de dados
        if(!await bcrypt.compare(senha, rows[0].Senha))
            return res.status(401).send({message: 'Credenciais incorretas'})

        //se a senha estiver correta cria o token jwt
        const token = jwt.sign(
            //dados que serão salvos no token
            {
                id: rows[0].ID_pessoa,
                nome: rows[0].Nome,
                email: rows[0].Email,
                data_login: new Date().toLocaleString('pt-BB')     
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
