/*traz a biblioteca que lê o arquivo .env e coloca as chaves em process.env*/
import dotenv from 'dotenv';

export function loadEnv() {
    dotenv.config(); /*lê o .env e popula process.env*/
    return { /*retorna um objeto de configuração com:*/
        NODE_ENV: process.env.NODE_ENV || 'development', /*ambiente da app (diz em que modo a aplicação está rodando. nesse caso, node_env) || default: 'development'*/
        PORT: process.env.PORT || 5001, /*porta da API || default: 5001*/
        DATA_FILE: process.env.DATA_FILE || './db/db.json', /*caminho do arquivo de dados quando o repositório é por arquivo || default: ./db/db.json*/
        REPOSITORY: process.env.REPOSITORY || 'file', /*tipo de repositório que será usado || default: 'file'*/
        /*dados do MySQL:*/
        DB_HOST: process.env.DB_HOST || 'localhost', /*pega o valor da variável DB_HOST no meu .env OU se não tiver, usa localhost*/
        DB_PORT: Number(process.env.DB_PORT) || 3306, /*converte a porta de string para número OU se não tiver, usa a 3306*/
        DB_USER: process.env.DB_USER || 'root', /*pega o usuário OU se não tiver, pega root*/
        DB_PASSWORD: process.env.DB_PASSWORD || '', /*pega a senha OU se não tiver, usa string vazia = sem senha*/
        DB_DATABASE: process.env.DB_DATABASE || '', /*pega o nome do banco OU se não tiver, usa string vazia = sem senha*/
        DB_SSL: String(process.env.DB_SSL || 'false').toLowerCase() === 'true' /*se tiver DB_SSL no .env, usa ele OU se não tiver, usa false. Depois converte o valor em string e deixa tudo minúsculo. Por fim, verifica se o resultado é true; se for o banco deve ser acessado usando conexão segura (SSL)*/
    };
}

/*resumindo: lê o .env e devolve um objeto de configs com valores padrão, garantindo que a API suba mesmo sem variáveis definidas*/
/*ps.: process.env é um objeto do Node que guarda as variáveis de ambiente*/
/*rodei npm install mysql2 -> dependência do node*/