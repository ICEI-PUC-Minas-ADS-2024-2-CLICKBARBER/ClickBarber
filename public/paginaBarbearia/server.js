const express = require("express");
const app = express();
const cors = require("cors");
const conexao = require("./conexao/conexao");
const { exec } = require("child_process"); // para abrir navegador sem pacotes extras

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// ==================== GET verificar email/cpf ====================
app.get("/barbeiros/verificar", (req, res) => {
const { email, cpf } = req.query;

let sql = "";
let valor = "";

if (email) {
sql = "SELECT E_mail FROM Pessoa WHERE E_mail = ?";
valor = email;
} else if (cpf) {
sql = "SELECT CPF FROM Pessoa WHERE CPF = ?";
valor = cpf;
} else {
return res.status(400).json({ erro: "Parâmetro necessário." });
}

conexao.query(sql, [valor], (err, result) => {
if (err) return res.status(500).json({ erro: "Erro no BD" });
res.json({ existe: result.length > 0 });
});
});

// ==================== POST criar barbeiro ====================
app.post("/barbeiros", (req, res) => {
const dados = req.body;

const sql = `       INSERT INTO Pessoa
      (CNPJ_barbearia, Nome, E_mail, Senha, CPF, Numero_telefone, Tipo_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

conexao.query(
sql,
[
dados.CNPJ_barbearia,
dados.Nome,
dados.E_mail,
dados.Senha,
dados.CPF,
dados.Numero_telefone,
dados.Tipo_usuario
],
(err, result) => {
if (err) return res.status(500).json({ erro: err });
res.json({ mensagem: "Barbeiro cadastrado", id: result.insertId });
}
);
});

//Iniciar servidor
const PORT = 4060;
app.listen(PORT, () => {
const url = `http://humble-journey-pjwxv7pr6gqw296q-4060.app.github.dev:${PORT}/cadastroBarbeiros.html`;
console.log(`Servidor rodando na porta ${PORT}`);
console.log(`Clique aqui para abrir: ${url}`);

// mostra no log um "link" direto para a pagina
const start =
process.platform === "win32"
? `start ${url}`
: process.platform === "darwin"
? `open ${url}`
: `xdg-open ${url}`;

exec(start, err => {
if (err) console.error("Não foi possível abrir o navegador:", err);
});
});
