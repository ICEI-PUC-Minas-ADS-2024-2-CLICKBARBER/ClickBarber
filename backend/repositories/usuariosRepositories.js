//importa as funções que fazem a leitura e escrita no banco de dados
import { readDB , writeDB } from '../utils/fileReader.js';
//importa o uuid para criar ids únicos
import { v4 as uuidv4 } from 'uuid';
//importa o bcrypt para criptografar a senha
import bcrypt from 'bcrypt';

//função que retorna todos os usuarios cadastrados
export async function getAllUsers() {
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem usuarios cadastrados
    if(!data.usuarios) return [];

    return data.usuarios;
}

//função que pega o usuario pelo id
export async function getUserById(id){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem usuarios cadastrados
    if(!data.usuarios) return null;

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = data.usuarios.findIndex(usuario => usuario.id == id);

    //se não encontrar retorna null
    if(index == -1) return null;

    return data.usuarios[index];
}

//função que pega o usuario pelo email
export async function getUserByEmail(email){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem usuarios cadastrados
    if(!data.usuarios) return null;

    //procura o index em que o email enviado é o mesmo doque o cadastrado
    const index = data.usuarios.findIndex(usuario => usuario.email == email);

    //se não encontrar retorna null
    if(index == -1) return null;

    return data.usuarios[index];
}

//função que verifica se o cpf já está cadastrado
export async function getCPF(cpf){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem usuarios cadastrados
    if(!data.usuarios) return null;

    //procura o index em que o cpf enviado é o mesmo doque o cadastrado
    const index = data.usuarios.findIndex(user => user.cpf ==cpf)

    //se não encontrar retorna false
    if(index == -1) return false;

    return true;
}

//função que verifica se o email já está cadastrado
export async function getEmail(email){
    //lê o banco de dados
    const data = await readDB();

    //verifica se existem usuarios cadastrados
    if(!data.usuarios) return null;

    //procura o index em que o email enviado é o mesmo doque o cadastrado
    const index = data.usuarios.findIndex(user => user.email == email)

    //se não encontrar retorna false
    if(index == -1) return false;

    return true;
}

//função que cria um novo usuario
export async function createNewUser(data){
    //pega os dados enviados
    const { email, nome , telefone , cpf, senha} = data;

    //lê o banco de dados
    const db = await readDB();

    //verifica se o array de usuarios existe, se não cria um novo
    if(!db.usuarios){
        db.usuarios = [];
    }

    //cria o novo usuario
    const newUsuario = {
        id: uuidv4(), //gera um id unico
        email: email,
        nome: nome,
        telefone: telefone,
        cpf: cpf,
        senha: await bcrypt.hash(senha, 10) //criptografa a senha
    }

    //adiciona o novo usuario ao array de usuarios
    db.usuarios.push(newUsuario);

    //escreve os novos dados no banco de dados
    return writeDB(db);
}

//função que atualiza os dados do usuario
export async function putUser(id , data){

    //pega os dados enviados
    const { email, nome, telefone, cpf, senha} = data
    
    //lê o banco de dados
    const db = await readDB();

    //verifica se existem usuarios cadastrados
    if(!db.usuarios){
        return null;
    }

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = db.usuarios.findIndex(usuario => usuario.id == id);

    //se não encontrar retorna null
    if(index === -1){
        return null;
    }

    //atualiza os dados do usuario (apenas email, nome e telefone)
    db.usuarios[index] = {
        ...db.usuarios[index],
        email:  email,
        nome:  nome,
        telefone:  telefone
    }
    
    //escreve os novos dados no banco de dados
    return writeDB(db);
}

//função que atualiza a senha do usuario
export async function patchPassword(id , password){

    //le o banco de dados
    const db = await readDB();

    //verifica se existe algum usuario
    if(!db.usuarios)
        return null;

    //pega o index em que o id enviado é igual ao que foi cadastrado
    const index = db.usuarios.findIndex(usuario => usuario.id == id);

    //verifica se o id enviado esta correto
    if(index == -1)
        return null;

    //criptografa a nova senha que foi enviada
    const newSenha = await bcrypt.hash(password , 10);

    //atualiza a senha do usuario
    db.usuarios[index].senha = newSenha;

    //escreve os novos dados no banco de dados
    return writeDB(db);
}

//função que deleta um usuario
export async function deleteUser(id){
    //lê o banco de dados
    const db = readDB();

    //verifica se existem usuarios cadastrados
    if(!db.usuarios){
        return null;
    }

    //procura o index em que o id enviado é o mesmo doque o cadastrado
    const index = db.usuarios.findIndex(usuario => usuario.id == id);

    //se não encontrar retorna null
    if(index === -1){
        return null;
    }

    //remove o usuario do array 
    db.usuarios.splice(index, 1);

    //escreve os novos dados no banco de dados
    return writeDB(db);
}
