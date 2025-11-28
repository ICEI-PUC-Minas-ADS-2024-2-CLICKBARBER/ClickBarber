const mysql = require("mysql2");

// Conecta usando os dados da URL do Railway
const conexao = mysql.createConnection({
    host: "gondola.proxy.rlwy.net",
    port: 44254,
    user: "wallyson",
    password: "senhaDoWallyson123",
    database: "railway"
});

//conecta  a conexão
conexao.connect((err) => {
    if (err) {
        console.error("Pres F to pay respect. Deu ruim no DB", err);
        return;
    }
    console.log("Conectado ao DB e pronto pro combate!");
});

//exporta para ser usada a conexão
module.exports = conexao;