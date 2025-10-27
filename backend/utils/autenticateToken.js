//importa o pacote jsonwebtoken
import jwt from 'jsonwebtoken';

//função que verifica se o token é válido
export async function verifyToken(req, res, next){
    //pega o token do cabeçalho da requisição (authorization)
    const auth = req.header['authorization'];

    //divide o token e pega só a parte do token
    const token = auth && auth.split('')[1];

    //verifica se o token existe
    if(!token)
        return res.status(401).send({message: 'Token não fornecido'});

    //verifica se o token é válido
    jwt.verify(token, 'chave_secreta', (err, user =>{
        if(err)
            return res.status(403).send({message:'Token inváçido'});

        //salva os dados do usuario na requisição e chama a proxima função
        req.user = user;
        next();
    }))
}