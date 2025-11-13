import { fileURLToPath } from 'url';
import path from 'path';
import {readFile, writeFile , rename, unlink} from 'fs/promises';

//pega o arquivo db.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', '..', 'db', 'db.json')

//função que lê o banco de dados
export async function readDB(){
    try{
        //lê o arquivo db.json
        const data = await readFile(DB_PATH, 'utf8');
        //retorna os dados em formato json
        return JSON.parse(data);

    }catch(error){
        console.error('Error reading database:', error);
        return { usuarios: [] };
    }
}

//função que escreve no banco de dados
export async function writeDB(data){

    //cria um arquivo temporario 
    const tempFile = DB_PATH + '.tmp';

    try{
        //escreve os dados no arquivo temporario
        await writeFile(tempFile, JSON.stringify(data, null, 2))

        //renomeia o arquivo temporario para o nome do banco de dados excluindo o antigo
        await rename(tempFile, DB_PATH);

        return true;

    }catch(error){
        console.error('Error writing database:', error);
        //remove o arquivo temporario em caso de erro
        await unlink(tempFile);
        return false;

    }
}
