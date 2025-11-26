import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Necessário para usar __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo db.json
const dbFile = path.join(__dirname, "db.json");

// Funções auxiliares
function readDB() {
  return JSON.parse(fs.readFileSync(dbFile, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

// SERVIR PASTA PUBLIC CORRETAMENTE
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// ================= ROTAS =======================

// GET /api/barbeiros
app.get("/api/barbeiros", (req, res) => {
  res.json(readDB().barbeiros);
});

// GET /api/servicos
app.get("/api/servicos", (req, res) => {
  res.json(readDB().servicos);
});

// GET /api/agendamentos
app.get("/api/agendamentos", (req, res) => {
  res.json(readDB().agendamentos);
});

// GET /api/agendamentos/:id
app.get("/api/agendamentos/:id", (req, res) => {
  const db = readDB();
  const ag = db.agendamentos.find(a => a.id == req.params.id);

  if (!ag) return res.status(404).json({ erro: "Agendamento não encontrado" });

  res.json(ag);
});

// POST /api/agendar
app.post("/api/agendar", (req, res) => {
  const db = readDB();
  const { barbeiro_id, cliente, servico_id, horario, data } = req.body;

  const barbeiro = db.barbeiros.find(b => b.id == barbeiro_id)?.nome;
  const servico = db.servicos.find(s => s.id == servico_id)?.nome;

  const novo = {
    id: Date.now(),
    barbeiro,
    cliente,
    servico,
    horario,
    data,
  };

  db.agendamentos.push(novo);
  writeDB(db);

  res.json(novo);
});

// PUT /api/agendar/:id
app.put("/api/agendar/:id", (req, res) => {
  const db = readDB();
  const ag = db.agendamentos.find(a => a.id == req.params.id);

  if (!ag) return res.status(404).json({ erro: "Agendamento não encontrado" });

  const { cliente, servico_id } = req.body;

  ag.cliente = cliente;
  ag.servico = db.servicos.find(s => s.id == servico_id)?.nome;

  writeDB(db);
  res.json(ag);
});

// DELETE /api/agendar/:id
app.delete("/api/agendar/:id", (req, res) => {
  const db = readDB();
  db.agendamentos = db.agendamentos.filter(a => a.id != req.params.id);
  writeDB(db);

  res.json({ sucesso: true });
});

// INICIALIZAÇÃO
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
