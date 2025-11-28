const express = require("express");
const router = express.Router();
const db = require("../conexao");   // <- usa a conexão criada

// LISTAR todos barbeiros
router.get("mysql://wallyson:senhaDoWallyson123@gondola.proxy.rlwy.net:44254/railway", (req, res) => {
    const sql = "SELECT * FROM Pessoa WHERE Tipo_usuario = 'funcionario'";
    //pega só os barbeiros

    db.query(sql, (err, resultado) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(resultado);
    });
});

// CRIAR barbeiro
router.post("mysql://wallyson:senhaDoWallyson123@gondola.proxy.rlwy.net:44254/railway", (req, res) => {
    const dados = req.body;

    const sql = "INSERT INTO Pessoa SET ?";
    //INSERT simples, joga tudo que vier no body

    db.query(sql, dados, (err, resultado) => {
        if (err) return res.status(500).json({ erro: err });

        res.json({ msg: "Barbeiro criado!", id: resultado.insertId });
    });
});

// EDITAR barbeiro
router.put("mysql://wallyson:senhaDoWallyson123@gondola.proxy.rlwy.net:44254/railway:id", (req, res) => {
    const id = req.params.id;
    const dados = req.body;

    const sql = "UPDATE Pessoa SET ? WHERE ID_pessoa = ?";
    //Atualiza os campos enviados no body

    db.query(sql, [dados, id], (err) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ msg: "Barbeiro atualizado!" });
    });
});



module.exports = router;
