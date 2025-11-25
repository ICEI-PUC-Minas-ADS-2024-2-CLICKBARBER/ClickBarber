import financeiroRepository from '../repository/financeiroRepository.mysql.js'; /*pega o export do produtoRepository.mysql.js*/

function normalizarPeriodo({ inicio, fim }) { /*normaliza o período de filtro*/
  return {
    inicio: inicio || null, /*se tiver um valor verdadeiro, usa ele. se for string vazia, vira null*/
    fim: fim || null
  };
}

async function listarPorDia({ inicio, fim, barbeiroId, servicoId }) { /*lista valor total por dia*/
  const periodo = normalizarPeriodo({ inicio, fim }); /*chama a função de normalizar o período*/
  return financeiroRepository.buscarPorDia({ /*chama o método buscarPorDia do financeiroRepository, passando um objeto com:*/
    ...periodo, /*os três pontos é o retorno de normalizarPeriodo*/
    barbeiroId,
    servicoId
  }); /*return o resultado da consulta*/
}

async function listarPorBarbeiro({ inicio, fim, barbeiroId, servicoId }) { /*lista valor total por barbeiro*/
  const periodo = normalizarPeriodo({ inicio, fim }); /*chama a função de normalizar o período*/
  return financeiroRepository.buscarPorBarbeiro({ /*chama o método buscarPorBarbeiro do financeiroRepository, passando um objeto com:*/
    ...periodo,
    barbeiroId,
    servicoId
  }); /*devolve o resultado do repository (lista com dados já agrupados por barbeiro)*/
}

async function listarPorServico({ inicio, fim, barbeiroId, servicoId }) { /*lista total por serviço*/
  const periodo = normalizarPeriodo({ inicio, fim }); /*chama a função de normalizar o período*/
  return financeiroRepository.buscarPorServico({ /*chama o método buscarPorServico do financeiroRepository, passando um objeto com:*/
    ...periodo,
    barbeiroId,
    servicoId
  }); /*devolve os dados vindos do banco (via repository)*/
}

async function gerarCsv({ tipoTabela, inicio, fim, barbeiroId, servicoId }) { /*gera o CSV a partir do tipo de tabela e filtros*/
  const tipo = tipoTabela || 'dia'; /*se tipoTabela veio preenchido (dia, barbeiro ou serviço...), tipo será esse valor. Se não, tipo vira "dia"*/

  if (tipo === 'dia') { /*se o tipo escolhido foi "dia"*/
    const linhas = await listarPorDia({ inicio, fim, barbeiroId, servicoId }); /*chama a função listarPorDia passando os filtros*/
    let csv = 'data,quantidade_atendimentos,total_faturado\n'; /*começando a string do CSV com o cabeçalho (nome das colunas) separados por vírgula + \n (quebra de linha)*/
    for (const l of linhas) { /*percorre cada linha retornada pelo banco*/
      csv += `${l.data},${l.quantidade_atendimentos},${l.total_faturado}\n`; /*para cada linha, adiciona uma nova linha na string do CSV com os valores daquela linha*/
    }
    return csv; /*devolve a string final do CSV pronta para ser baixada*/
  }

  if (tipo === 'barbeiro') { /*se o tipo escolhido foi "barbeiro"*/
    const linhas = await listarPorBarbeiro({ inicio, fim, servicoId }); /*chama a função listarPorBarbeiro passando os filtros*/
    let csv = 'barbeiro,quantidade_atendimentos,total_faturado\n'; /*começando a string do CSV*/
    for (const l of linhas) { /*percorre cada linha retornada pelo banco*/
      csv += `${l.barbeiro},${l.quantidade_atendimentos},${l.total_faturado}\n`; /*adiciona os valores na linha*/
    }
    return csv; /*devolve a string final do CSV pronta para ser baixada*/
  }

  if (tipo === 'servico') { /*se o tipo escolhido foi "serviço" - MESMA LÓGICA*/
    const linhas = await listarPorServico({ inicio, fim, barbeiroId });
    let csv = 'servico,quantidade_servicos,total_faturado\n';
    for (const l of linhas) {
      csv += `${l.servico},${l.quantidade_servicos},${l.total_faturado}\n`;
    }
    return csv;
  }

  throw new Error('tipoTabela inválido'); /*se não caiu em nenhum if acima, lança um erro para avisar que o tipo de tabela não é aceito*/
}

export default { /*disponibiliza as funções aqui do service para o controller usar*/
  listarPorDia,
  listarPorBarbeiro,
  listarPorServico,
  gerarCsv /*pdf é gerado no controller*/
};

