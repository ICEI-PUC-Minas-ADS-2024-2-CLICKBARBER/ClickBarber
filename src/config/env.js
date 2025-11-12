/*traz a biblioteca que lê o arquivo .env e coloca as chaves em process.env*/
import dotenv from 'dotenv';

export function loadEnv() {
    dotenv.config(); /*lê o .env e popula process.env*/
    return { /*retorna um objeto de configuração com:*/
        NODE_ENV: process.env.NODE_ENV || 'development', /*ambiente da app (diz em que modo a aplicação está rodando. nesse caso, node_env) || default: 'development'*/
        PORT: process.env.PORT || 5001, /*porta da API || default: 5001*/
        DATA_FILE: process.env.DATA_FILE || './db/db.json', /*caminho do arquivo de dados quando o repositório é por arquivo || default: ./db/db.json*/
        REPOSITORY: process.env.REPOSITORY || 'file' /*tipo de repositório que será usado || default: 'file'*/
    };
}

/*resumindo: lê o .env e devolve um objeto de configs com valores padrão, garantindo que a API suba mesmo sem variáveis definidas*/