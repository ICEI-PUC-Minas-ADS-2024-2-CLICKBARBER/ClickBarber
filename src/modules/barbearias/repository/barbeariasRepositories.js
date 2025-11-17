//importa a pool do banco de dados
import { pool } from '../../../index.js';
//importa o bcrypt para criptografar a senha
import bcrypt from 'bcrypt';

//função que retorna todos as barbearias cadastradas
export async function getAllBarbearias(){
    //pega todas as barbearias cadastradas no banco de dados
    const [rows] = await pool.execute('select * from Barbearia') ;

    return rows ;
}

//função que pega a barbearia pelo CNPJ
export async function getBarbeariaByCNPJ(cnpj){
    //pega a barbearia cujo CNPJ é igual o enviado
    const [rows] = await pool.execute('select * from Barbearia where CNPJ_barbearia = ?' ,[cnpj] ) ;

    return rows[0]
}

//função que pega a barbearia pelo email
export async function getBarbeariasByEmail(email){
    //pega a barbearia cujo email é igual o enviado
    const [rows] = await pool.execute('select * from Barbearia where email = ?', [email] )

    return rows[0];
}

//função que verifica se o cnpj já está cadastrado
export async function getCNPJ(cnpj){
    //pega a barbearia cujo CNPJ é igual o enviado
    const [rows] = await pool.execute('select * from Barbearia where CNPJ_barbearia = ?' ,[cnpj]);

    //se for maior que zero é porque existe e envia true
    return rows.length > 0; 
}

//função que verifica se o email já está cadastrado
export async function getEmail(email){
    //pega a barbearia cujo email é igual o enviado
    const [rows] = await pool.execute('select * from Barbearia where email = ?' ,[email]);

    //se for maior que zero é porque existe e envia true
    return rows.length > 0; 
}

//função que cria uma nova barbearia
export async function createNewBarbearia(data){
    //pega os dados enviados
    let {email, nome, telefone, cnpj, senha , cep, rua , cidade , bairro , num} = data;
    const ddd = `${telefone[0]}${telefone[1]}` //pega o ddd do numero enviado (2 primeiros numeros)
    telefone = telefone.slice(2); //tira o ddd do telefone enviado
    senha = await bcrypt.hash(senha, 10) //criptografa a senha

    //cadastra todas as informações enviadas no banco de dados
    const [result] = await pool.execute(
        'insert into Barbearia (CNPJ_barbearia , Nome , email , DDD_telefone , Numero_Telefone , senha , CEP_endereco , Cidade_endereco , Bairro_endereco , Rua_endereco , Numero_endereco) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[cnpj , nome , email , ddd , telefone ,senha , cep , cidade , bairro , rua , num]) ;

    //se nenhuma linha for alterada é porque o usuário não foi cadastrado        
    return result.affectedRows > 0 ;
}

//função que atualiza os dados da barbearia
export async function putBarbearia(cnpj, data){
    //pega os dados enviados
    const {email, nome , telefone ,cep , rua , cidade , bairro , num} = data;
    const ddd = `${telefone[0]}${telefone[1]}` //pega o ddd do numero enviado (2 primeiros numeros)
    telefone = telefone.slice(2);  //tira o ddd do telefone enviado

    //atualiza todas as informações enviadas no banco de dados
    const [result] = await pool.execute('update Barbearia set Nome = ? , email = ?, DDD_telefone = ?, Numero_Telefone = ? ,CEP_endereco = ?, Cidade_endereco = ? , Bairro_endereco = ?, Rua_endereco = ?, Numero_endereco = ? where CNPJ_barbearia = ?' , [nome , email , ddd , telefone , cep , cidade , bairro , rua , num , cnpj])

    //se nenhuma linha for alterada é porque o usuário não foi atualizado  
    return result.affectedRows > 0;
}

//função que deleta uma barbearia
export async function deleteBarbearia(cnpj){
    //exclui a barbearia cujo id é igual ao enviado
    const [result] = await pool.execute('delete from Barbearia where CNPJ_barbearia = ?' , [cnpj])

    //se for menor que zero é porque a barbearia não foi excluida
    return result.affectedRows > 0;
}