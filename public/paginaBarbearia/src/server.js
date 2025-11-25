// 1 Importa o Express
const express = require('express');
const path = require('path');

// 2 Cria uma aplicação Express
const app = express();

// 3 Define a pasta 'public' (pasta anterior à atual)
app.use(express.static(path.join(__dirname, '..')));

// 4 Rota para servir o arquivo index.html ao acessar a raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..','index.html'));
});

// 5 Define a porta que o servidor vai usar
const PORT = 3000;

// 6 Faz o servidor "ouvir" na porta escolhida
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
