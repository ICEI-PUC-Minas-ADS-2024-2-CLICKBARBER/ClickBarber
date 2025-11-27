//importa a pool do banco de dados
import { pool } from '../../../index.js';
//importa o bcrypt para comparar a senha
import bcrypt from 'bcrypt';
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';

export async function loginB(req, res){

    try{
        //pega o cnpj e a senha enviados
        const {cnpj , senha} = req.body;

        //verifica se eles são válidos
        if(!cnpj || !senha || cnpj.length != 14)
            return res.status(401).send({message: "Credenciais incorretas"});

        //pega a barbearia cujo cnpj é igual ao enviado
        const [rows] = await pool.execute('select * from Barbearia where CNPJ_barbearia = ?' , [cnpj])

        //verifica se ela existe
        if(!rows[0])
            return res.status(401).send({message: "Credenciais incorretas"})

        //verifica se a senha dessa barbearia é igual a enviada
        if(!(await bcrypt.compare(senha , rows[0].senha)))
            return res.status(401).send({message: "Credenciais incorretas"}); 

        //se for cria um token que será usado pra provar que esta barbearia esta logada
        const token = jwt.sign(
            {
                email: rows[0].email,
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
