/*a ponte entre o backend e o banco de dados*/

import mysql from 'mysql2/promise'; /*biblioteca que fala com o MySQL usando async/await (por isso promise)*/
import { loadEnv } from '../../../config/env.js'; /*é a função que eu criei pra ler as variáveis do .env e devolver um objeto*/
const CNPJ_FIXO_TESTE = '12312312341234'; // CNPJ pra teste

const env = loadEnv(); /*carrego as variáveis do .env e guardo em env*/

const pool = mysql.createPool({ /*em vez de abrir/fechar conexão toda hora, ele cria um conjunto de conexões e vai reutilizando*/
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined /*se for falso, fica sem SSL*/
});

function toBoolAtividade(v) { /*gravo no banco 'Ativo' ou 'Inativo'*/
    return String(v).toLowerCase() === 'ativo';
}

function toBoolDescartabilidade(v) { /*gravo no banco 'Descartável' ou não*/
    return String(v).toLowerCase() === 'sim';
}

function mapProdutoRow(row) { /*essa função recebe uma linha vinda do banco (row) — resultado do SELECT com JOIN*/
    return { /*retorna essa linha em formato frontend*/
        id: row.ID_produto, /*cria um novo objeto (produto) que ja recebe um id (que é o valor da coluna ID_produto do banco)*/
        nome: row.Nome, /*pega o nome direto da coluna Nome da tabela Produto*/
        imagem: row.Imagem,
        quantidade: row.Quantidade,
        validade: row.validade,
        categoria: row.categoriaNome,    /*Categoria.Nome*/
        marca: row.marcaNome,            /*Marca.Nome*/
        unidade: row.unidadeSigla,       /*Unidade.Sigla*/
        ativo: toBoolAtividade(row.Atividade),
        descartavel: toBoolDescartabilidade(row.Descartabilidade),

        /*vou usar futuramente*/
        cnpjBarbearia: row.CNPJ_barbearia,
        idCategoria: row.ID_categoria,
        idMarca: row.ID_marca,
        idUnidade: row.ID_unidade
    };
}

async function getOrCreateCategoria(nome) {
    if (!nome) return null; /*se o nome da categoria não for selecionado, retorna null*/
    const [rows] = await pool.query( /*procura a categoria no BD*/
        'SELECT ID_categoria FROM Categoria WHERE Nome = ?',
        [nome]
    );
    if (rows[0]) return rows[0].ID_categoria; /*se rows[0], significa que já tem uma categoria com esse nome. Então ele não cria nada, só devolve o ID que já existe*/
    /*se a categoria ainda não existe:*/
    const [result] = await pool.query(
        'INSERT INTO Categoria (Nome) VALUES (?)', /*insere o nome na tabela*/
        [nome]
    );
    return result.insertId; /*retorna o id gerado*/
}

async function getOrCreateMarca(nome) { /*mesma lógica que "categoria"*/
    if (!nome) return null;
    const [rows] = await pool.query(
        'SELECT ID_marca FROM Marca WHERE Nome = ?',
        [nome]
    );
    if (rows[0]) return rows[0].ID_marca;

    const [result] = await pool.query(
        'INSERT INTO Marca (Nome) VALUES (?)',
        [nome]
    );
    return result.insertId;
}

async function getOrCreateUnidade(sigla) { /*mesma lógica que "categoria"*/
    if (!sigla) return null;
    const [rows] = await pool.query(
        'SELECT ID_unidade FROM Unidade WHERE Sigla = ?',
        [sigla]
    );
    if (rows[0]) return rows[0].ID_unidade;

    const [result] = await pool.query(
        'INSERT INTO Unidade (Sigla) VALUES (?)',
        [sigla]
    );
    return result.insertId;
}

const produtoRepositoryMySQL = { /*lista produtos. Filtros: search, categoria, ativo, descartável*/
    async list({ search, categoria, ativo, descartavel }) { /*esses filtros vêm lá do service, que recebe da controller, que recebe da query string*/
        /*montando a consulta, que busca categoria + marca + unidade, formata a validade e deixa a cláusula WHERE pronta para receber filtros*/
        let sql = ` 
        SELECT
          p.ID_produto,
          p.CNPJ_barbearia,
          p.Nome,
          p.Imagem,
          p.Quantidade,
          DATE_FORMAT(p.Validade, '%Y-%m-%d') AS validade,
          p.Atividade,
          p.Descartabilidade,
          p.ID_categoria,
          p.ID_marca,
          p.ID_unidade,
          c.Nome  AS categoriaNome,
          m.Nome  AS marcaNome,
          u.Sigla AS unidadeSigla
        FROM Produto p
        LEFT JOIN Categoria c ON c.ID_categoria = p.ID_categoria
        LEFT JOIN Marca    m ON m.ID_marca     = p.ID_marca
        LEFT JOIN Unidade  u ON u.ID_unidade   = p.ID_unidade
        WHERE 1 = 1
      `;
        const params = []; /*esse array guarda os valores que entram nas ? da query*/

        if (search) { /*filtro de busca*/
            const s = `%${String(search).toLowerCase()}%`; /*transforma o texto em string, deixa minúsculas e coloca % antes e depois*/
            /*busca esse texto em nome do produto, nome da categoria ou nome da marca:*/
            sql += `
          AND (
            LOWER(p.Nome) LIKE ?
            OR LOWER(c.Nome) LIKE ?
            OR LOWER(m.Nome) LIKE ?
          )
        `;
            params.push(s, s, s); /*preenche os três ? com o mesmo valor de s*/
        }

        if (categoria) { /*se categoria estiver preenchida*/
            sql += ' AND LOWER(c.Nome) = ?'; /*adiciona mais um and no where*/
            params.push(String(categoria).toLowerCase());
        }

        const [rows] = await pool.query(sql, params); /*envia pro MySQL o SQL montado + o array de parâmetros pros ?*/
        let out = rows.map(mapProdutoRow); /*converte as linhas do banco pro formato do front*/

        /*filtro em cima do array out já carregado:*/
        if (ativo !== undefined) { /*filtra só se o parâmetro ativo veio na chamada*/
            const bool = String(ativo) === 'true'; /*transforma o valor em string e compara com true*/
            out = out.filter(p => p.ativo === bool); /*mantém só os produtos cujo p.ativo seja igual a bool*/
        }

        if (descartavel !== undefined) { /*mesma lógica que a atividade*/
            const bool = String(descartavel) === 'true';
            out = out.filter(p => p.descartavel === bool);
        }

        return out; /*devolve o array de produtos vindo do banco, com JOIN nas tabelas auxiliares, convertido pro formato correto e aplicado os filtros (search, categoria, ativo, descartavel)*/
    },

    /*busca um produto pelo id:*/
    async findById(id) { /*recebe um parâmetro id*/
        const [rows] = await pool.query( /*usa o pool de conexões MySQL pra executar uma query (um comando)*/
            /*SQL que vai ser executado: */
            `
          SELECT 
            p.ID_produto,
            p.CNPJ_barbearia,
            p.Nome,
            p.Imagem,
            p.Quantidade,
            DATE_FORMAT(p.Validade, '%Y-%m-%d') AS validade,
            p.Atividade,
            p.Descartabilidade,
            p.ID_categoria,
            p.ID_marca,
            p.ID_unidade,
            c.Nome  AS categoriaNome,
            m.Nome  AS marcaNome,
            u.Sigla AS unidadeSigla
          FROM Produto p
          LEFT JOIN Categoria c ON c.ID_categoria = p.ID_categoria
          LEFT JOIN Marca    m ON m.ID_marca     = p.ID_marca
          LEFT JOIN Unidade  u ON u.ID_unidade   = p.ID_unidade
          WHERE p.ID_produto = ?
          `,
            [id]
        );

        if (!rows[0]) return null; /*se não existir nenhuma linha, significa que não tem produto com esse ID e retorna null*/
        return mapProdutoRow(rows[0]); /*se encontrou, pega a linha e passa pra mapProdutoRow, que transforma a linha crua do banco num objeto no formato esperado pelo frontend e retorna esse objeto*/
    },

    /*cria um novo produto:*/
    async create(produto) { /*recebe um objeto produto já validado pelo service, vindo do frontend*/
        const idCategoria = await getOrCreateCategoria(produto.categoria); /*transforma texto em id*/
        const idMarca = await getOrCreateMarca(produto.marca);
        const idUnidade = await getOrCreateUnidade(produto.unidade);

        const atividadeDB = produto.ativo ? 'Ativo' : 'Inativo'; /*converte os booleans do JS em texto pro banco*/
        const descartabilidadeDB = produto.descartavel ? 'Sim' : 'Não';

        const cnpj = produto.cnpjBarbearia || CNPJ_FIXO_TESTE; /*CNPJ opcional: agora pode ser undefined, depois o front manda de verdade*/

        const [result] = await pool.query( /*executa insert no banco*/
            `
          INSERT INTO Produto
            (CNPJ_barbearia, Nome, Imagem, Quantidade, Validade,
             Atividade, Descartabilidade, ID_categoria, ID_marca, ID_unidade)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            /*array com os valores para cada ?, na mesma ordem:*/
            [
                cnpj,
                produto.nome,
                produto.imagem || null,
                produto.quantidade,
                produto.validade || null,
                atividadeDB,
                descartabilidadeDB,
                idCategoria,
                idMarca,
                idUnidade
            ]
        );

        return this.findById(result.insertId); /*retorna esse produto pronto pro controller responder pro frontend*/
    },

    /*atualiza um produto*/
    async update(id, data) { /*data = campos que vieram do frontend pro update*/
        const atual = await this.findById(id); /*busca o produto no banco*/
        if (!atual) return null; /*se não existir, retorna null*/

        const merged = { ...atual, ...data }; /*cria o objeto merged que une tudo que já existia + alterações*/

        const idCategoria = await getOrCreateCategoria(merged.categoria);
        const idMarca = await getOrCreateMarca(merged.marca);
        const idUnidade = await getOrCreateUnidade(merged.unidade);

        const atividadeDB = merged.ativo ? 'Ativo' : 'Inativo';
        const descartabilidadeDB = merged.descartavel ? 'Sim' : 'Não';

        const cnpj = merged.cnpjBarbearia || CNPJ_FIXO_TESTE;

        await pool.query( /*executa o UPDATE no banco*/
            `
          UPDATE Produto SET
            CNPJ_barbearia   = ?,
            Nome             = ?,
            Imagem           = ?,
            Quantidade       = ?,
            Validade         = ?,
            Atividade        = ?,
            Descartabilidade = ?,
            ID_categoria     = ?,
            ID_marca         = ?,
            ID_unidade       = ?
          WHERE ID_produto = ?
          `,
            [
                /*array de valores pro UPDATE:*/
                cnpj,
                merged.nome,
                merged.imagem || null,
                merged.quantidade,
                merged.validade || null,
                atividadeDB,
                descartabilidadeDB,
                idCategoria,
                idMarca,
                idUnidade,
                id
            ]
        );

        return this.findById(id); /*depois de atualizar, busca de novo o produto com findById pra garantir que retorne o estado mais recente*/
    },

    /*apaga um produto*/
    async delete(id) { /*recebe o id (que é passado para a ?)*/
        const [result] = await pool.query( /*executa um DELETE no banco*/
            'DELETE FROM Produto WHERE ID_produto = ?',
            [id]
        );
        return result.affectedRows > 0; /*diz quantas linhas foram afetadas. Se for 0, não tinha produto com esse ID (false), se for 1 apagou um produto (true)*/
    },

    /*listar as categorias (nomes) usadas em produtos*/
    async categorias() {
        const [rows] = await pool.query(
            `
          SELECT DISTINCT c.Nome AS categoria
          FROM Produto p
          JOIN Categoria c ON c.ID_categoria = p.ID_categoria
          WHERE TRIM(IFNULL(c.Nome, '')) <> ''
          ORDER BY c.Nome
          `
        );
        return rows.map(r => r.categoria); /*retorna um array de strings que o frontend usa pra montar selects, cards de serviços...*/
    }
};

export default produtoRepositoryMySQL; /*torna produtoRepositoryMySQL disponível para outros arquivos usarem*/

/*ps.: where = quais linhas da tabela eu quero buscar/atualizar/apagar?*/