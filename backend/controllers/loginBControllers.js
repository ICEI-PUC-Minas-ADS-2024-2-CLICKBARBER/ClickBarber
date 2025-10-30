import {readDB} from '../utils/fileReader.js';
//importa o bcrypt para comparar a senha
import bcrypt from 'bcrypt';
//importa o jwt para criar o token
import jwt from 'jsonwebtoken';

export async function loginB(req, res){

    try{
        const {cnpj , senha} = req.body;

        if(!cnpj || !senha || cnpj.length != 14)
            return res.status(401).send({message: "Credenciais incorretas"});

        const db = await readDB();

        if(!db.barbearias)
            return res.status(401).send({message: "Barbearia não encontrada"})

        const barbearia = db.barbearias.find(barbearia => barbearia.cnpj == cnpj);
        
        if(!barbearia)
            return res.status(404).send({message: "Barbearia não encontrada"});

        if(!(await bcrypt.compare(senha , barbearia.senha)))
            return res.status(401).send({message: "Credenciais incorretas"}); 

        const token = jwt.sign(
            {
                id: barbearia.id,
                email: barbearia.email,
                nome: barbearia.nome,
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
