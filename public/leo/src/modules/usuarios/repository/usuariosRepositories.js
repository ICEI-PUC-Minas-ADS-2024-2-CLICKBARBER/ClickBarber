//importa a pool do banco de dados
import { pool } from '../../../index.js';
//importa o bcrypt para criptografar a senha
import bcrypt from 'bcrypt';

//função que retorna todos os usuarios cadastrados
export async function getAllUsers() {
    //pega todas os usuarios que estão cadastrados no banco de dados
    const [rows] = await pool.execute('select * from Pessoa where Tipo_usuario = "cliente"');

    return rows;
}

//função que pega o usuario pelo id
export async function getUserById(id){
    //procura no banco de dados e pega o usuario cujo id é igual ao enviado
    const [rows] = await pool.execute('select * from Pessoa where ID_pessoa = ? and Tipo_usuario = "cliente"' , [id]);

    return rows[0]
}

//função que pega o usuario pelo email
export async function getUserByEmail(email){
    //procura no banco de dados e pega o usuario cujo email é igual ao enviado
    const [rows] = await pool.execute('select * from Pessoa where E_mail = ? and Tipo_usuario = "cliente"' , [email]);

    return rows[0]
}

//função que verifica se o cpf já está cadastrado
export async function getCPF(cpf){
    //verifica se existe algum usuario com cpf igual ao enviado no banco de dados
    const [rows] = await pool.execute('select * from Pessoa where CPF = ? and Tipo_usuario = "cliente" ' ,[cpf]);

    //se for maior que 0 é porque existe e retorna true
    return rows.length > 0 ;
}

//função que verifica se o email já está cadastrado
export async function getEmail(email){
    //verifica se existe algum usuario com email igual ao enviado no banco de dados
    const [rows] = await pool.execute('select * from Pessoa where E_mail = ? and Tipo_usuario = "cliente" ' ,[email]);

    //se for maior que 0 é porque existe e retorna true
    return rows.length > 0
}

//função que cria um novo usuario
export async function createNewUser(data){
    //pega os dados enviados
    let { email, nome , telefone , cpf, senha} = data;
    const ddd = `${telefone[0]}${telefone[1]}` //pega o ddd do numero enviado (2 primeiros numeros)
    telefone = telefone.slice(2); //tira o ddd do telefone enviado
    senha = await bcrypt.hash(senha, 10) //criptografa a senha

    //cadastra todas as informações enviadas no banco de dados
    const [result] =  await pool.execute('insert into Pessoa (E_mail , Nome , CPF , DDD_telefone , Numero_Telefone , Senha , Tipo_usuario) VALUES (?,?,?,?,?,?, "cliente")',[email , nome , cpf , ddd , telefone , senha])

    //se nenhuma linha for alterada é porque o usuário não foi cadastrado
    return result.affectedRows > 0
}

//função que atualiza os dados do usuario
export async function putUser(id , data){

    //pega os dados enviados
    const { email, nome , telefone} = data;
    const ddd = `${telefone[0]}${telefone[1]}` //pega o ddd do numero enviado (2 primeiros numeros)
    telefone = telefone.slice(2); //tira o ddd do telefone enviado

    //altera no banco de dados o usuario do id enviado
    const [result] =  await pool.execute('update Pessoa set E_mail = ? , Nome = ? , DDD_telefone = ? , Numero_Telefone = ? where ID_pessoa = ?',[email , nome , ddd , telefone , id])

    //se nenhuma linha for alterada é porque o usuário não foi atualizado
    return result.affectedRows > 0
}

//função que atualiza a senha do usuario
export async function patchPassword(id , password){
    
    const [rows] = await pool.execute('select Senha from Pessoa where ID_pessoa = ?',[id])
    //verifica se o usuario existe
    if(!rows[0]) return false

    //pega a nova senha e criptografa ela
    const newSenha = await bcrypt.hash(password , 10);

    //atualiza a senha do usuario
    const [result] = await pool.execute('update Pessoa set Senha = ? where ID_pessoa = ?',[newSenha , id]);

    //se nenhuma linha for alterada é porque a senha do usuário não foi atualizada
    return result.affectedRows > 0 ;
}

//função que deleta um usuario
export async function deleteUser(id){

    const [result] = await pool.execute('delete from Pessoa where ID_pessoa = ?',[id])

    //se nenhuma linha for alterada é porque o usuário não foi excluido
    return result.affectedRows > 0 ;
}
