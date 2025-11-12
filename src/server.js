/*LIGA A PORTA À API (app.js)*/

/*traz o app.js já configurado e a função que carrega variáveis de ambiente*/
import { app } from './app.js';
import { loadEnv } from './config/env.js';

/*carrega configurações e define a porta*/
const env = loadEnv(); /*lê o .env e guarda em env*/
const port = env.PORT || 5001; /*escolhe a porta: usa env.PORT se existir ou a 5001*/

/*sobe o servidor*/
app.listen(port, () => { /*inicia o HTTP na porta escolhida e mostra no console a URL para acesso*/
    console.log(`API ClickBarber rodando em http://localhost:${port}`);
});

/*o .env (configurar o sistema sem mexer nos arquivos .js):
define a porta onde a API vai escutar (3000)
define o caminho do arquivo onde os dados serão salvos/lidos quando o repositório for do tipo “arquivo”. Ex.: meu CRUD grava e lê de db/db.json
define qual repositório usar (futuramente, mysql)
*/

/*o .gitignore:
diz ao Git quais arquivos/pastas não devem ser rastreados nem enviados para o repositório. Isso evita subir coisas pesadas ou privadas (backend) e mantém o repo limpo, só com código-fonte*/

/*já o package.json e package-lock.json são arquivos json:
pj: informa o que o npm tem que ler para saber o que instalar e como rodar
plj: gerado pelo npm
*/