const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão Railway
const pool = mysql.createPool({
  host: "gondola.proxy.rlwy.net",
  port: 44254,
  user: "arthur",
  password: "senhaDoArthur123",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10
});

/* ============================================
        LISTAS PARA SELECTS
============================================ */

// CLIENTES (tabela Pessoa)
app.get("/clientes", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_pessoa AS id_pessoa, Nome FROM Pessoa ORDER BY Nome"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

// BARBEIROS (view com serviços JSON)
app.get("/barbeiros", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM view_barbeiros_servicos_json");

    const barbeiros = rows.map(b => {
      let servicosRaw = b.servicos ?? b.servicos_json;

      let servicosArr = [];
      if (typeof servicosRaw === "string") {
        try {
          servicosArr = JSON.parse(servicosRaw);
        } catch {
          servicosArr = [];
        }
      } else if (Array.isArray(servicosRaw)) {
        servicosArr = servicosRaw;
      }

      return {
        id_barbeiro: b.id_barbeiro,
        nome: b.nome_barbeiro ?? b.nome,
        servicos: servicosArr
      };
    });

    res.json(barbeiros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar barbeiros" });
  }
});

// SERVIÇOS (opcional - se quiser endpoint separado)
app.get("/servicos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT ID_servico, Titulo AS nome, Preco AS valor FROM Servico ORDER BY Titulo"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao carregar serviços" });
  }
});

/* ============================================
        CRIAR ATENDIMENTO
============================================ */
app.post("/atendimentos", async (req, res) => {
  const {
    id_pessoa,
    id_barbeiro,
    servicos,        // array: [{id, nome, preco}, ...]
    valor_total,
    forma_pagamento,
    nome_servicos    // String com nomes separados por vírgula
  } = req.body;

  if (!id_pessoa || !id_barbeiro || !servicos || servicos.length === 0) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando." });
  }

  try {
    // 1. Insere o atendimento principal
    const sql = `
      INSERT INTO Atendimento 
      (id_pessoa, id_barbeiro, data_hora, valor_total, status, forma_pagamento, nome_servicos)
      VALUES (?, ?, NOW(), ?, 'Pendente', ?, ?)
    `;

    const [result] = await pool.query(sql, [
      id_pessoa,
      id_barbeiro,
      valor_total,
      forma_pagamento || null,
      nome_servicos || ""  // Usa o nome_servicos enviado pelo frontend
    ]);

    const id_atendimento = result.insertId;

    // 2. (Opcional) Cria registros na tabela Atendimento_Servico
    // para relacionar os serviços específicos
    if (servicos && Array.isArray(servicos)) {
      for (const servico of servicos) {
        try {
          await pool.query(
            `INSERT INTO Atendimento_Servico (id_atendimento, id_servico) VALUES (?, ?)`,
            [id_atendimento, servico.id]
          );
        } catch (err) {
          console.warn(`Aviso: Não foi possível vincular serviço ${servico.id} ao atendimento.`);
          // Continua mesmo se falhar - o nome dos serviços já está salvo em nome_servicos
        }
      }
    }

    res.json({
      mensagem: "Atendimento criado com sucesso!",
      id_atendimento: id_atendimento
    });

  } catch (error) {
    console.error("Erro ao criar atendimento:", error);
    res.status(500).json({ erro: "Erro ao criar atendimento." });
  }
});

/* ============================================
            ATUALIZAR STATUS
============================================ */
app.patch("/atendimentos/:id/status", async (req, res) => {
  const { status } = req.body;

  try {
    await pool.query(
      "UPDATE Atendimento SET status = ? WHERE id_atendimento = ?",
      [status, req.params.id]
    );

    res.json({ mensagem: "Status atualizado!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar status" });
  }
});

/* ============================================
            LISTAR ATENDIMENTOS
============================================ */
app.get("/atendimentos", async (req, res) => {
  try {
    const sql = `
      SELECT A.*, 
             P.Nome AS Cliente, 
             B.Nome AS Barbeiro
      FROM Atendimento A
      JOIN Pessoa P ON P.id_pessoa = A.id_pessoa
      JOIN BarbeiroInfo B ON B.id_barbeiro = A.id_barbeiro
      ORDER BY A.id_atendimento DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar atendimentos" });
  }
});

app.listen(3002, () => {
  console.log("API rodando na porta 3002");
});