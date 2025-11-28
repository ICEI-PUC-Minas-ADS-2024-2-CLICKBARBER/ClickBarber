const express = require("express");
const app = express();
const cors = require("cors");
const conexao = require("./conexao/conexao"); // sua conexão MySQL


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

// ==================== GET todos os barbeiros ====================
app.get("/barbeiros", (req, res) => {
  const sql = "SELECT * FROM Pessoa WHERE Tipo_usuario = 'barbeiro'";
  conexao.query(sql, (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro no BD" });
    res.json(result);
  });
});

// ==================== POST criar barbeiro ====================
app.post("/barbeiros", (req, res) => {
  const dados = req.body;

  const sql = `
    INSERT INTO Pessoa
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

// ==================== Iniciar servidor ====================
const PORT = 4060;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/cadastroBarbeiros.html`;
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Abra no navegador: ${url}`);

 
});
