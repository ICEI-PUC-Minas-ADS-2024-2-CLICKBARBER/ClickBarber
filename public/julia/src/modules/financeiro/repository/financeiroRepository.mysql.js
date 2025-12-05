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
      DATE(data_hora) AS data,
      COUNT(*) AS quantidade_atendimentos,
      SUM(valor_total) AS total_faturado
    FROM Atendimento
    WHERE status = 'FINALIZADO'
  `;
  const params = []; /*array params que vai guardar os valores para os ? da query*/

  if (inicio) { /*se inicio foi informado*/
    const inicioStr = String(inicio).slice(0, 10);
    sql += ' AND DATE(data_hora) >= ?'; /*adiciona à query: AND DATE(data_atendimento) >= ?*/
    params.push(inicioStr); /*adiciona o valor de inicio no array params; o ? será substituído por esse inicio na hora de executar a query*/
  }

  if (fim) { /*se fim foi informado:*/
    const fimStr = String(fim).slice(0, 10);
    sql += ' AND DATE(data_hora) <= ?'; /*adiciona o filtro de data máxima*/
    params.push(fimStr); /*coloca o valor em params*/
  }

  /*finaliza a query:*/
  sql += `
    GROUP BY DATE(data_hora)
    ORDER BY DATE(data_hora) DESC
  `;

  const [rows] = await pool.query(sql, params); /*executa a query no MySQL*/
  /*sql → string com a consulta; params → valores para substituir os ?; pool.query retorna um array [rows, fields] → pego só rows*/
  return rows; /*retorna a lista de linhas pro service*/
}

/*total por barbeiro:*/
async function buscarPorBarbeiro({ inicio, fim, barbeiroId, /*servicoId*/ }) {
  let sql = `
    SELECT 
      v.nome_barbeiro AS barbeiro,
      COUNT(a.id_atendimento) AS quantidade_atendimentos,
      SUM(a.valor_total) AS total_faturado
    FROM Atendimento a
    JOIN view_barbeiros_servicos_json v           
      ON v.id_barbeiro = a.id_barbeiro
    WHERE a.status = 'FINALIZADO'
  `;
  const params = [];

  if (inicio) { /*data mínima*/
    const inicioStr = String(inicio).slice(0, 10);
    sql += ' AND DATE(a.data_hora) >= ?';
    params.push(inicioStr);
  }

  if (fim) { /*data máxima*/
    const fimStr = String(fim).slice(0, 10);
    sql += ' AND DATE(a.data_hora) <= ?';
    params.push(fimStr);
  }

  if (barbeiroId) { /*barbeiro específico*/
    sql += ' AND a.id_barbeiro = ?';
    params.push(barbeiroId);
  }

  sql += `
   GROUP BY v.id_barbeiro, v.nome_barbeiro                       
    ORDER BY total_faturado DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/*total por serviço:*/
async function buscarPorServico({ inicio, fim, barbeiroId, servicoId }) {
  let sql = `
    SELECT 
      a.nome_servicos AS servico,
      COUNT(a.id_atendimento) AS quantidade_servicos,
      SUM(a.valor_total) AS total_faturado
    FROM Atendimento a
    WHERE a.status = 'FINALIZADO'
  `;
  const params = [];

  if (inicio) { /*início do período*/
    const inicioStr = String(inicio).slice(0, 10);
    sql += ' AND DATE(a.data_hora) >= ?';
    params.push(inicioStr);
  }

  if (fim) { /*fim do período*/
    const fimStr = String(fim).slice(0, 10);
    sql += ' AND DATE(a.data_hora) <= ?';
    params.push(fimStr);
  }

  if (barbeiroId) { /*barbeiro específico*/
    sql += ' AND a.id_barbeiro = ?';
    params.push(barbeiroId);
  }

  if (servicoId) { /*serviço específico*/
    sql += ' AND a.nome_servicos = (SELECT s.Titulo FROM Servico s WHERE s.ID_servico = ?)';
    params.push(servicoId);
  }

  sql += `
    GROUP BY a.nome_servicos
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
