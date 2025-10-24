import jwt from 'jsonwebtoken';

export async function verifyToken(req, res, next){
    const auth = req.header['authorization'];

    const token = auth && auth.split('')[1];

    if(!token)
        return res.status(401).send({message: 'Token não fornecido'});

    jwt.verify(token, 'chave_secreta', (err, user =>{
        if(err)
            return res.status(403).send({message:'Token inváçido'});

        req.user = user;
        next();
    }))
}