const express = require("express");
const router = express.Router();
const db = require("../conexao"); // importa a conexão

// -------------------------------
// GET - pegar TODAS as barbearias
// -------------------------------
router.get("/", (req, res) => {
    const sql = "SELECT * FROM Barbearia";

    db.query(sql, (err, resultados) => {
        if (err) {
            console.log("Erro ao buscar barbearias:", err);
            return res.status(500).send("Erro no servidor");
        }

        res.send(resultados); // manda pra tela
    });
});


// -------------------------------
// GET por CNPJ - pegar UMA barbearia
// -------------------------------
router.get("/:cnpj", (req, res) => {
    const cnpj = req.params.cnpj;

    const sql = "SELECT * FROM Barbearia WHERE CNPJ_barbearia = ?";

    db.query(sql, [cnpj], (err, resultado) => {
        if (err) {
            console.log("Erro ao buscar barbearia:", err);
            return res.status(500).send("Erro no servidor");
        }

        res.send(resultado[0] || {}); // retorna só 1
    });
});


// --------------------------------------------
// POST - cadastrar barbearia nova
// --------------------------------------------
router.post("/", (req, res) => {
    // pega os campos enviados pelo body
    const {
        CNPJ_barbearia,
        Nome,
        Imagem,
        Rua_endereco,
        CEP_endereco,
        Numero_endereco,
        Cidade_endereco,
        Bairro_endereco,
        Cod_pais_telefone,
        DDD_telefone,
        Numero_telefone,
        Descrição,
        email,
        senha
    } = req.body;

    const sql = `
        INSERT INTO Barbearia (
            CNPJ_barbearia, Nome, Imagem, Rua_endereco, CEP_endereco,
            Numero_endereco, Cidade_endereco, Bairro_endereco,
            Cod_pais_telefone, DDD_telefone, Numero_telefone,
            Descrição, email, senha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        CNPJ_barbearia, Nome, Imagem, Rua_endereco, CEP_endereco,
        Numero_endereco, Cidade_endereco, Bairro_endereco,
        Cod_pais_telefone, DDD_telefone, Numero_telefone,
        Descrição, email, senha
    ],
        (err, resultado) => {
            if (err) {
                console.log("Erro ao cadastrar barbearia:", err);
                return res.status(500).send("Erro no servidor");
            }

            res.send({
                mensagem: "Barbearia cadastrada!",
                id: CNPJ_barbearia
            });
        }
    );
});


// --------------------------------------------
// PUT - atualizar barbearia existente
// --------------------------------------------
router.put("/:cnpj", (req, res) => {
    const cnpj = req.params.cnpj;

    const campos = req.body; // só atualiza o que mandarem

    const sql = "UPDATE Barbearia SET ? WHERE CNPJ_barbearia = ?";

    db.query(sql, [campos, cnpj], (err, resultado) => {
        if (err) {
            console.log("Erro ao atualizar barbearia:", err);
            return res.status(500).send("Erro no servidor");
        }

        res.send({ mensagem: "Barbearia atualizada!" });
    });
});


// --------------------------------------------
// DELETE - remover barbearia
// --------------------------------------------
router.delete("/:cnpj", (req, res) => {
    const cnpj = req.params.cnpj;

    const sql = "DELETE FROM Barbearia WHERE CNPJ_barbearia = ?";

    db.query(sql, [cnpj], (err) => {
        if (err) {
            console.log("Erro ao remover barbearia:", err);
            return res.status(500).send("Erro no servidor");
        }

        res.send({ mensagem: "Barbearia removida!" });
    });
});


// exporta as rotas para usar no server.js
module.exports = router;
