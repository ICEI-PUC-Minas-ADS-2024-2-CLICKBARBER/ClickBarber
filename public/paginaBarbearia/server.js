//importar dependencias
const express = require('express');
const mysql = require('mysql2');

const host = mysql.createConnection({
    host:'gondola.proxy.rlwy.net',
    user:'wallyson',
    password:'senhaDoWallyson123',
    database:'railway',
});

const app = express();

app.get('/',function(req, res){

    res.write('Hello World!');
    res.end();
})

//servidor
app.listen(5090);