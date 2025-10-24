import { fileURLToPath } from 'url';
import path from 'path';
import {readFile, writeFile , rename, unlink} from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', '..', 'db', 'db.json')

export async function readDB(){
    try{
        const data = await readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    }catch(error){
        console.error('Error reading database:', error);
        return { usuarios: [] };
    }
}
export async function writeDB(data){

    const tempFile = DB_PATH + '.tmp';

    try{
        await writeFile(tempFile, JSON.stringify(data, null, 2))

        await rename(tempFile, DB_PATH);

        return true
    }catch(error){
        console.error('Error writing database:', error);

        await unlink(tempFile);
        return false
    }
}
