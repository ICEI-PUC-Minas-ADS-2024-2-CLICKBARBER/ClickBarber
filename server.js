  // ===============================================================
  // 1️⃣ IMPORTAÇÃO DOS MÓDULOS NECESSÁRIOS
  // ===============================================================
  import express from "express";  // Framework que simplifica a criação de servidores HTTP
  import cors from "cors";        // Middleware que habilita o acesso entre domínios (Frontend ↔ Backend)
  import fs from "fs";            // Módulo nativo do Node.js para ler e gravar arquivos


  // ===============================================================
  // 2️⃣ CONFIGURAÇÃO INICIAL DO SERVIDOR EXPRESS
  // ===============================================================
  const app = express(); // Cria a aplicação Express

  // Habilita o uso de CORS (permite requisições de origens diferentes, ex: localhost:3000 ↔ localhost:5500)
  app.use(cors());

  // Habilita o parsing automático de requisições com corpo em formato JSON
  // Exemplo: req.body = { "cliente": "João", "horario": "09:00" }
  app.use(express.json());

  // Define a pasta "public" como estática, ou seja, todos os arquivos lá
  // (HTML, CSS, JS, imagens etc.) serão servidos diretamente pelo servidor.
  app.use(express.static("public"));


  // ===============================================================
  // 3️⃣ ARQUIVO DE BANCO DE DADOS LOCAL
  // ===============================================================
  // O arquivo db.json contém os dados persistidos:
  // {
  //   "barbeiros": [...],
  //   "servicos": [...],
  //   "agendamentos": [...]
  // }
  const dbFile = "./db.json";


  // ===============================================================
  // 4️⃣ FUNÇÕES AUXILIARES PARA MANIPULAR O db.json
  // ===============================================================

  /**
   * Lê o conteúdo atual do arquivo db.json e o converte para objeto JavaScript.
   * @returns {object} Dados atuais da base.
   */
  function readDB() {
    // Lê o conteúdo do arquivo (formato texto) e faz o parse (JSON → Objeto)
    return JSON.parse(fs.readFileSync(dbFile, "utf8"));
  }

  /**
   * Grava um objeto atualizado no arquivo db.json.
   * @param {object} data - Dados a serem salvos.
   */
  function writeDB(data) {
    // Transforma o objeto em JSON formatado (com espaçamento) e salva no disco
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  }


  // ===============================================================
  // 5️⃣ ROTAS DA API (ENDPOINTS REST)
  // ===============================================================

  // ---------------------------------------------------------------
  // 🔹 GET /api/barbeiros
  // Retorna a lista completa de barbeiros cadastrados no sistema.
  // ---------------------------------------------------------------
  app.get("/api/barbeiros", (req, res) => {
    const db = readDB();               // Lê os dados atuais
    res.json(db.barbeiros);            // Envia apenas a lista de barbeiros
  });


  // ---------------------------------------------------------------
  // 🔹 GET /api/servicos
  // Retorna todos os tipos de serviços disponíveis (ex: Corte, Barba).
  // ---------------------------------------------------------------
  app.get("/api/servicos", (req, res) => {
    const db = readDB();
    res.json(db.servicos);
  });


  // ---------------------------------------------------------------
  // 🔹 GET /api/agendamentos
  // Retorna todos os agendamentos existentes.
  // ---------------------------------------------------------------
  app.get("/api/agendamentos", (req, res) => {
    const db = readDB();
    res.json(db.agendamentos);
  });


  // ---------------------------------------------------------------
  // 🔹 GET /api/agendamentos/:id
  // Retorna um agendamento específico com base no seu ID.
  // ---------------------------------------------------------------
  app.get("/api/agendamentos/:id", (req, res) => {
    const db = readDB();

    // Busca o agendamento cujo "id" é igual ao parâmetro da rota
    const ag = db.agendamentos.find(a => a.id == req.params.id);

    // Caso encontrado, retorna o agendamento; senão, responde com erro 404
    if (ag)
      res.json(ag);
    else
      res.status(404).json({ erro: "Agendamento não encontrado" });
  });


  // ---------------------------------------------------------------
  // 🔹 POST /api/agendar
  // Cria um novo agendamento.
  // ---------------------------------------------------------------
  app.post("/api/agendar", (req, res) => {
    const db = readDB();

    // Extrai os dados enviados pelo frontend
    const { barbeiro_id, cliente, servico_id, horario, data } = req.body;

    // Localiza o nome do barbeiro e serviço com base nos IDs informados
    const barbeiro = db.barbeiros.find(b => b.id == barbeiro_id)?.nome;
    const servico = db.servicos.find(s => s.id == servico_id)?.nome;

    // Cria um novo objeto de agendamento com ID único (usando timestamp)
    const novo = {
      id: Date.now(),   // ID baseado no horário atual (suficiente para protótipo)
      barbeiro,         // Nome do barbeiro (resolvido acima)
      cliente,          // Nome do cliente digitado no formulário
      servico,          // Nome do serviço
      horario,          // Ex: "10:30"
      data              // Data no formato "YYYY-MM-DD"
    };

    // Adiciona o novo agendamento à lista existente
    db.agendamentos.push(novo);

    // Salva no arquivo db.json
    writeDB(db);

    // Retorna o novo agendamento como resposta
    res.json(novo);
  });


  // ---------------------------------------------------------------
  // 🔹 PUT /api/agendar/:id
  // Atualiza (edita) um agendamento existente.
  // ---------------------------------------------------------------
  app.put("/api/agendar/:id", (req, res) => {
    const db = readDB();

    // Busca o agendamento a ser alterado
    const ag = db.agendamentos.find(a => a.id == req.params.id);

    if (ag) {
      // Extrai apenas os campos permitidos para edição
      const { cliente, servico_id } = req.body;

      // Atualiza o nome do cliente e o nome do serviço
      ag.cliente = cliente;
      ag.servico = db.servicos.find(s => s.id == servico_id)?.nome;

      // Persiste as alterações no arquivo
      writeDB(db);

      // Retorna o agendamento atualizado
      res.json(ag);
    } else {
      // Caso o ID não exista, retorna erro
      res.status(404).json({ erro: "Agendamento não encontrado" });
    }
  });


  // ---------------------------------------------------------------
  // 🔹 DELETE /api/agendar/:id
  // Exclui permanentemente um agendamento.
  // ---------------------------------------------------------------
  app.delete("/api/agendar/:id", (req, res) => {
    const db = readDB();

    // Remove o item cujo ID é diferente do informado (mantém os demais)
    db.agendamentos = db.agendamentos.filter(a => a.id != req.params.id);

    // Salva o novo estado da base de dados
    writeDB(db);

    // Retorna uma resposta simples confirmando a exclusão
    res.json({ sucesso: true });
  });


  // ===============================================================
  // 6️⃣ INICIALIZAÇÃO DO SERVIDOR
  // ===============================================================
  const PORT = 3000; // Porta onde o servidor vai escutar (http://localhost:3000)

  // Inicia o servidor e exibe mensagem no console
  app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
