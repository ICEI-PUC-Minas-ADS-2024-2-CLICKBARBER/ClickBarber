//importa as funções de leitura e escrita do banco de dados
import { readDB , writeDB } from '../utils/fileReader.js';
//importa o uuid para criar ids únicos
import { v4 as uuidv4 } from 'uuid';
//importa o bcrypt para criptografar a senha
import bcrypt from 'bcrypt';

//função que retorna todos as barbearias cadastradas
export async function getAllBarbearias(){
    //lê o banco de dados
    const data = await readDB();
    
    //verifica se existem barbearias cadastradas
    if(!data.barbearias) return [];

    return data.barbearias;
}

//função que pega a barbearia pelo id
export async function getBarbeariaById(id){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem barbearias cadastradas
    if(!data.barbearias) return null;

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = data.barbearias.findIndex(usuario => usuario.id ==id);

    //se não encontrar retorna null
    if(index == -1) return null;

    return data.barbearias[index];
}

//função que pega a barbearia pelo email
export async function getBarbeariasByEmail(email){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem barbearias cadastradas
    if(!data.barbearias) return null;

    //procura o index em que o email enviado é o mesmo doque o cadastrado
    const index = data.barbearias.findIndex(usuario => usuario.email ==email);

    //se não encontrar retorna null
    if(index ==-1) return null;

    return data.barbearias[index];
}

//função que verifica se o cnpj já está cadastrado
export async function getCNPJ(cnpj){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem barbearias cadastradas
    if(!data.barbearias) return null;

    //procura o index em que o cnpj enviado é o mesmo doque o cadastrado
    const index = data.barbearias.findIndex(user => user.cnpj ==cnpj)

    //se não encontrar retorna false
    if(index == -1) return false;

    return true;
}

//função que verifica se o email já está cadastrado
export async function getEmail(email){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem barbearias cadastradas
    if(!data.barbearias) return null;

    //procura o index em que o email enviado é o mesmo doque o cadastrado
    const index = data.barbearias.findIndex(user => user.email == email)

    //se não encontrar retorna false
    if(index == -1) return false;

    return true;
}

//função que cria uma nova barbearia
export async function createNewBarbearia(data){
    //pega os dados enviados
    const {email, nome, telefone, cnpj, senha} = data;

    //lê o banco de dados
    const dados = await readDB();

    //verifica se o array de barbearias existe, se não cria um novo
    if(!dados.barbearias)
        dados.barbearias = [];

    //cria a nova barbearia
    const newBarbearia = {
        id: uuidv4(), //gera um id unico
        email: email,
        nome: nome,
        telefone: telefone,
        cnpj: cnpj,
        senha: await bcrypt.hash(senha, 10) //criptografa a senha
    }

    //adiciona a nova barbearia no array lido
    dados.barbearias.push(newBarbearia);

    //escreve os novos dados no banco de dados
    return writeDB(dados);
}

//função que atualiza os dados da barbearia
export async function putBarbearia(id, data){
    //pega os dados enviados
    const {email, nome , telefone} = data;

    //lê o banco de dados
    const db = await readDB();

    //verifica se existem barbearias cadastradas
    if(!db.barbearias) return null;

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = db.barbearias.findIndex(usuario => usuario.id ==id);

    //se não encontrar retorna null
    if(index === -1) return null;

    //atualiza os dados da barbearia (apena email, nome e telefone)
    db.barbearias[index] = {
        ...db.barbearias[index],
        email: email,
        nome: nome,
        telefone: telefone
    }

    //escreve os novos dados no banco de dados
    return writeDB(db);
}

//função que deleta uma barbearia
export async function deleteBarbearia(id){
    //lê o banco de dados
    const db = await readDB();

    //verifica se existem barbearias cadastradas
    if(!db.barbearias) return null;

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = db.barbearias.findIndex(usuario => usuario.id ==id);

    //se não encontrar retorna null
    if(index === -1) return null;

    //remove a barbearia do array
    db.barbearias.splice(index, 1);

    //escreve os novos dados no banco de dados
    return writeDB(db);
}