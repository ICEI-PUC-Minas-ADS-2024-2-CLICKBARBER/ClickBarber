//importa o pacote jsonwebtoken
import jwt from 'jsonwebtoken';

//função que verifica se o token é válido
export async function verifyToken(req, res, next){

    try{
        //pega o token enviado no header
        const auth = req.headers.authorization

        if(!auth)
            return res.status(401).send({message: 'Token não fornecido'})

        //exclui a parte 'Bearer' e pega so o token
        const token = auth.split(' ')[1]

        //verifica se o token existe
        if(!token)
            return res.status(401).send({message: 'Token não fornecido'});

        //verifica se o token é válido
        jwt.verify(token, 'chave_secreta', (error, dados) =>{
            if(error)
                return res.status(403).send({message: 'Token inválido'})

            //salva os dados do usuario/barbearia na requisição e chama a proxima função
            req.dados = dados;
            next();
        })

    }catch(error){
        return res.status(500).send({message: `Erro interno do servidor `})
    }
}