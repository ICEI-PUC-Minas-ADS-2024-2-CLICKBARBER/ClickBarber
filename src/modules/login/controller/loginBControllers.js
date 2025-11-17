//importa a pool do banco de dados
import { pool } from '../../../index.js';
//importa o bcrypt para comparar a senha
import bcrypt from 'bcrypt';
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';

export async function loginB(req, res){

    try{
        const {cnpj , senha} = req.body;

        if(!cnpj || !senha || cnpj.length != 14)
            return res.status(401).send({message: "Credenciais incorretas"});

        const [rows] = await pool.execute('select * from Barbearia where CNPJ_barbearia = ?' , [cnpj])

        if(!rows[0])
            return res.status(401).send({message: "Credenciais incorretas"})

        if(!(await bcrypt.compare(senha , rows[0].senha)))
            return res.status(401).send({message: "Credenciais incorretas"}); 

        const token = jwt.sign(
            {
                email: rows[0].Email,
                nome: rows[0].Nome,
                data_login: new Date().toLocaleString('pt-BB')
            },
            "chave_secreta"
        )

        return res.status(200).send({
            message: "Login realizado com sucesso",
            token: token
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor : ${error}`});
    }
}
