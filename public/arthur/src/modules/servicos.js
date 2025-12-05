const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "gondola.proxy.rlwy.net",
  port: 44254,
  user: "arthur",
  password: "senhaDoArthur123",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10
});

// GET todos
app.get("/servicos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM Servico ORDER BY ID_servico");
  res.json(rows);
});

// GET por ID
app.get("/servicos/:id", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM Servico WHERE ID_servico = ?",
    [req.params.id]
  );
  res.json(rows[0]);
});

// POST criar
app.post("/servicos", async (req, res) => {
  const { titulo, descricao, preco, duracao } = req.body;

  const CNPJ_FIXO = "12312312341235"; // <<< CNPJ QUE EXISTE NA TABELA

  await pool.query(
    "INSERT INTO Servico (Titulo, Descricao, Duracao, Preco, CNPJ_barbearia) VALUES (?,?,?,?,?)",
    [titulo, descricao, duracao, preco, CNPJ_FIXO]
  );

  res.json({ message: "Serviço criado!" });
});


// PUT editar
app.put("/servicos/:id", async (req, res) => {
  const { titulo, descricao, preco, duracao } = req.body;

  await pool.query(
    "UPDATE Servico SET Titulo=?, Descricao=?, Preco=?, Duracao=? WHERE ID_servico=?",
    [titulo, descricao, preco, duracao, req.params.id]
  );

  res.json({ message: "Serviço atualizado!" });
});

// DELETE remover
app.delete("/servicos/:id", async (req, res) => {
  await pool.query("DELETE FROM Servico WHERE ID_servico = ?", [
    req.params.id,
  ]);

  res.json({ message: "Serviço removido!" });
});

app.listen(3001, () => console.log("API rodando na porta 3001"));
