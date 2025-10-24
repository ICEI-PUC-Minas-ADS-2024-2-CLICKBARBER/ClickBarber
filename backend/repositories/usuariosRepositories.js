import { readDB , writeDB } from '../utils/fileReader.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function getAllUsers() {
    const data = await readDB();

    if(!data.usuarios) return [];

    return data.usuarios;
}
export async function getUserById(id){
    const data = await readDB();

    if(!data.usuarios) return null;

    const index = data.usuarios.findIndex(usuario => usuario.id == id);

    if(index == -1) return null;

    return data.usuarios[index];
}
export async function getUserByEmail(email){
    const data = await readDB();

    if(!data.usuarios) return null;

    const index = data.usuarios.findIndex(usuario => usuario.email == email);

    if(index == -1) return null;

    return data.usuarios[index];
}

export async function getCPF(cpf){
    const data = await readDB();

    if(!data.usuarios) return null;

    const index = data.usuarios.findIndex(user => user.cpf ==cpf)

    if(index == -1) return false;

    return true;
}

export async function getEmail(email){
    const data = await readDB();

    if(!data.usuarios) return null;

    const index = data.usuarios.findIndex(user => user.email == email)

    if(index == -1) return false;

    return true;
}

export async function createNewUser(data){
    const { email, nome , telefone , cpf, senha} = data;

    const db = await readDB();

    if(!db.usuarios){
        db.usuarios = [];
    }

    const newUsuario = {
        id: uuidv4(),
        email: email,
        nome: nome,
        telefone: telefone,
        cpf: cpf,
        senha: await bcrypt.hash(senha, 10)
    }

    db.usuarios.push(newUsuario);

    return writeDB(db);
}

export async function putUser(id , data){

    const { email, nome, telefone, cpf, senha} = data
    
    const db = await readDB();

    if(!db.usuarios){
        return null;
    }

    const index = db.usuarios.findIndex(usuario => usuario.id == id);

    if(index === -1){
        return null;
    }

    db.usuarios[index] = {
        ...db.usuarios[index],
        email:  email,
        nome:  nome,
        telefone:  telefone,
        cpf:  cpf
    }
    
    return writeDB(db);
}

export async function deleteUser(id){
    const db = readDB();

    if(!db.usuarios){
        return null;
    }
    const index = db.usuarios.findIndex(usuario => usuario.id == id);

    if(index === -1){
        return null;
    }

    db.usuarios.splice(index, 1);

    return writeDB(db);
}
