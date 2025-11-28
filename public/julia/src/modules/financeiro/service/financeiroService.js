/*import financeiroRepository from '../repository/financeiroRepository.mysql.js'; pega o export do produtoRepository.mysql.js*/
import financeiroRepository from '../repository/financeiroRepository.js'; /*TESTE BD LOCAL*/

/*LISTA FAKE de barbeiros*/
const BARBEIROS_MOCK = [
  { id: 1, nome: 'Barbeiro João' },
  { id: 2, nome: 'Barbeiro Carlos' },
  { id: 3, nome: 'Barbeiro Lucas' }
];

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
    /*barbeiroId,
    servicoId*/
  }); /*return o resultado da consulta*/
}

/*DESCOMENTAR DEPOIS DA API async function listarPorBarbeiro({ inicio, fim, barbeiroId, servicoId }) { /*lista valor total por barbeiro
  const periodo = normalizarPeriodo({ inicio, fim }); /*chama a função de normalizar o período
  return financeiroRepository.buscarPorBarbeiro({ /*chama o método buscarPorBarbeiro do financeiroRepository, passando um objeto com:
    ...periodo,
    barbeiroId,
    /*servicoId -> essa linha NÃO DESCOMENTAR
  }); /*devolve o resultado do repository (lista com dados já agrupados por barbeiro)
}*/

/*função fake enquanto não existir os barbeiros*/
async function listarPorBarbeiro({ inicio, fim, barbeiroId, servicoId }) {
  if (barbeiroId) { /*se o usuário escolheu um barbeiro*/
    const b = BARBEIROS_MOCK.find(x => x.id === Number(barbeiroId));
    if (!b) {
      return [];
    }
    return [{
      barbeiro: b.nome,
      quantidade_atendimentos: 0,
      total_faturado: 0
    }];
  }
  return BARBEIROS_MOCK.map(b => ({ /*se ele escolheu Todos*/
    barbeiro: b.nome,
    quantidade_atendimentos: 0,
    total_faturado: 0
  }));
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

  const labelTipo = { /*tipo de relatório*/
    dia: 'por período',
    barbeiro: 'por barbeiro',
    servico: 'por serviço'
  }[tipo] || tipo;

  const inicioStr = inicio ? String(inicio).slice(0, 10) : ''; /*a data do período*/
  const fimStr = fim ? String(fim).slice(0, 10) : '';
  let periodoLinha;
  if (inicioStr && fimStr) {
    periodoLinha = `Período: ${inicioStr} até ${fimStr}\n`; /*mostrando o período*/
  } else {
    periodoLinha = 'Período: não informado\n';
  }

  const cabecalhoBase = /*montando a estrutura do cabeçalho*/
    'Relatório Financeiro - Click Barber\n' + `Tipo de relatório: ${labelTipo}\n` + periodoLinha + '\n';

  if (tipo === 'dia') { /*se o tipo escolhido foi "dia"*/
    const linhas = await listarPorDia({ inicio, fim/*, barbeiroId, servicoId*/ }); /*chama a função listarPorDia passando os filtros*/
    let csv = cabecalhoBase;
    csv += 'Data, Quantidade de atendimentos, Total faturado\n'; /*começando a string do CSV com o cabeçalho (nome das colunas) separados por vírgula + \n (quebra de linha)*/
    if (!linhas || linhas.length === 0) { /*se não houver linhas na tabela*/
      csv += 'Nenhum registro encontrado.\n';
      return csv;
    }
    for (const l of linhas) { /*percorre cada linha retornada pelo banco*/
      csv += `${l.data}, ${l.quantidade_atendimentos}, ${l.total_faturado}\n`; /*para cada linha, adiciona uma nova linha na string do CSV com os valores daquela linha*/
    }
    return csv; /*devolve a string final do CSV pronta para ser baixada*/
  }

  if (tipo === 'barbeiro') { /*se o tipo escolhido foi "barbeiro"*/
    const linhas = await listarPorBarbeiro({ inicio, fim, barbeiroId /*servicoId*/ }); /*chama a função listarPorBarbeiro passando os filtros*/
    let csv = cabecalhoBase;
    csv += 'Barbeiro, Quantidade de atendimentos, Total faturado\n'; /*começando a string do CSV*/
    if (!linhas || linhas.length === 0) { /*se não houver linhas na tabela*/
      csv += 'Nenhum registro encontrado.\n';
      return csv;
    }
    for (const l of linhas) { /*percorre cada linha retornada pelo banco*/
      csv += `${l.barbeiro}, ${l.quantidade_atendimentos}, ${l.total_faturado}\n`; /*adiciona os valores na linha*/
    }
    return csv; /*devolve a string final do CSV pronta para ser baixada*/
  }

  if (tipo === 'servico') { /*se o tipo escolhido foi "serviço" - MESMA LÓGICA*/
    const linhas = await listarPorServico({ inicio, fim, barbeiroId, servicoId /*servicoId = adicionei*/ });
    let csv = cabecalhoBase;
    csv += 'Serviço, Quantidade prestada de serviços, Total faturado\n';
    if (!linhas || linhas.length === 0) { /*se não houver linhas na tabela*/
      csv += 'Nenhum registro encontrado.\n';
      return csv;
    }
    for (const l of linhas) {
      csv += `${l.servico}, ${l.quantidade_servicos}, ${l.total_faturado}\n`;
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

