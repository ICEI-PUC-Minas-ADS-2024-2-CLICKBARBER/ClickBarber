import { readDB , writeDB } from '../utils/fileReader.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function getAllBarbearias(){
    const data = await readDB();

    if(!data.barbearias) return [];

    return data.barbearias;
}
export async function getBarbeariaById(id){
    const data = await readDB();

    if(!data.barbearias) return null;

    const index = data.barbearias.findIndex(usuario => usuario.id ==id);

    if(index == -1) return null;

    return data.barbearias[index];
}
export async function getBarbeariasByEmail(email){
    const data = await readDB();

    if(!data.barbearias) return null;

    const index = data.barbearias.findIndex(usuario => usuario.email ==email);

    if(index ==-1) return null;

    return data.barbearias[index];
}

export async function getCNPJ(cnpj){
    const data = await readDB();

    if(!data.barbearias) return null;

    const index = data.barbearias.findIndex(user => user.cnpj ==cnpj)

    if(index == -1) return false;

    return true;
}

export async function getEmail(email){
    const data = await readDB();

    if(!data.barbearias) return null;

    const index = data.barbearias.findIndex(user => user.email == email)

    if(index == -1) return false;

    return true;
}

export async function createNewBarbearia(data){
    const {email, nome, telefone, cnpj, senha} = data;

    const dados = await readDB();

    if(!dados.barbearias)
        dados.barbearias = [];

    const newBarbearia = {
        id: uuidv4(),
        email: email,
        nome: nome,
        telefone: telefone,
        cnpj: cnpj,
        senha: await bcrypt.hash(senha, 10)
    }

    dados.barbearias.push(newBarbearia);

    return writeDB(dados);
}
async function putBarbearia(id, data){
    const {email, nome , telefone} = data;

    const db = await readDB();

    if(!db.barbearias) return null;

    const index = db.barbearias.findIndex(usuario => usuario.id ==id);

    if(index === -1) return null;

    db.barbearias[index] = {
        ...db.barbearias[index],
        email: email,
        nome: nome,
        telefone: telefone
    }

    return  writeDB(db);
}
async function deleteBarbearia(id){
    const db = await readDB();

    if(!db.barbearias) return null;

    const index = db.barbearias.findIndex(usuario => usuario.id ==id);

    if(index === -1) return null;

    db.barbearias.splice(index, 1);

    return writeDB(db);
}