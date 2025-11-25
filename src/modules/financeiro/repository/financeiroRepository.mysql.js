import mysql from 'mysql2/promise'; /*biblioteca que fala com o MySQL usando async/await (por isso promise)*/
import { loadEnv } from '../../../config/env.js'; /*é a função que eu criei pra ler as variáveis do .env e devolver um objeto*/

const env = loadEnv(); /*carrego as variáveis do .env e guardo em env*/

const pool = mysql.createPool({ /*pool de conexões com o banco de dados*/
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined
});

/*total por dia:*/
async function buscarPorDia({ inicio, fim, barbeiroId, servicoId }) { /*função buscarPorDia que recebe esses 4 filtros*/
  /*começa a montar a string da query SQL:*/
  let sql = `
    SELECT 
      DATE(data_atendimento) AS data,
      COUNT(*) AS quantidade_atendimentos,
      SUM(valor_total) AS total_faturado
    FROM atendimentos
    WHERE status = 'FINALIZADO'
  `;
  const params = []; /*array params que vai guardar os valores para os ? da query*/

  if (inicio) { /*se inicio foi informado*/
    sql += ' AND DATE(data_atendimento) >= ?'; /*adiciona à query: AND DATE(data_atendimento) >= ?*/
    params.push(inicio); /*adiciona o valor de inicio no array params; o ? será substituído por esse inicio na hora de executar a query*/
  }

  if (fim) { /*se fim foi informado:*/
    sql += ' AND DATE(data_atendimento) <= ?'; /*adiciona o filtro de data máxima*/
    params.push(fim); /*coloca o valor em params*/
  }

  /*if (barbeiroId) { se veio barbeiroId:
    sql += ' AND barbeiro_id = ?'; /*filtra para apenas aquele barbeiro
    params.push(barbeiroId); /*adiciona o id na lista de parâmetros.
  }*/

  /*if (servicoId) { MESMA lógica que o barbeiro
    sql += ' AND servico_id = ?';
    params.push(servicoId);
  }*/

  /*finaliza a query:*/
  sql += `
    GROUP BY DATE(data_atendimento)
    ORDER BY DATE(data_atendimento) DESC
  `;

  const [rows] = await pool.query(sql, params); /*executa a query no MySQL*/
  /*sql → string com a consulta; params → valores para substituir os ?; pool.query retorna um array [rows, fields] → pego só rows*/
  return rows; /*retorna a lista de linhas pro service*/
}

/*total por barbeiro:*/
async function buscarPorBarbeiro({ inicio, fim, barbeiroId, servicoId }) {
  let sql = `
    SELECT 
      b.nome AS barbeiro,
      COUNT(a.id) AS quantidade_atendimentos,
      SUM(a.valor_total) AS total_faturado
    FROM atendimentos a
    JOIN barbeiros b ON b.id = a.barbeiro_id
    WHERE a.status = 'FINALIZADO'
  `;
  const params = [];

  if (inicio) { /*data mínima*/
    sql += ' AND DATE(a.data_atendimento) >= ?';
    params.push(inicio);
  }

  if (fim) { /*data máxima*/
    sql += ' AND DATE(a.data_atendimento) <= ?';
    params.push(fim);
  }

  /*if (servicoId) { serviço especificado
    sql += ' AND a.servico_id = ?';
    params.push(servicoId);
  }*/

  if (barbeiroId) { /*barbeiro específico*/
    sql += ' AND a.barbeiro_id = ?';
    params.push(barbeiroId);
  }

  sql += `
    GROUP BY b.id, b.nome
    ORDER BY total_faturado DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/*total por serviço:*/
async function buscarPorServico({ inicio, fim, barbeiroId, servicoId }) {
  let sql = `
    SELECT 
      s.nome AS servico,
      COUNT(a.id) AS quantidade_servicos,
      SUM(a.valor_total) AS total_faturado
    FROM atendimentos a
    JOIN servicos s ON s.id = a.servico_id
    WHERE a.status = 'FINALIZADO'
  `;
  const params = [];

  if (inicio) { /*início do período*/
    sql += ' AND DATE(a.data_atendimento) >= ?';
    params.push(inicio);
  }

  if (fim) { /*fim do período*/
    sql += ' AND DATE(a.data_atendimento) <= ?';
    params.push(fim);
  }

  if (servicoId) { /*serviço específico*/
    sql += ' AND a.servico_id = ?';
    params.push(servicoId);
  }

  if (barbeiroId) { /*barbeiro específico*/
    sql += ' AND a.barbeiro_id = ?';
    params.push(barbeiroId);
  }

  sql += `
    GROUP BY s.id, s.nome
    ORDER BY total_faturado DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

export default { /*exporta as três funções (daqui do repositório) para o service*/
  buscarPorDia,
  buscarPorBarbeiro,
  buscarPorServico
};
