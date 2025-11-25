import Joi from 'joi'; /*importa o Joi - biblioteca de validação: define regras dos campos e valida o payload*/

/*era const filtroRelatorioSchema*/
/*define o schema - formato e regras dos dados- de validação do produto*/
const schemaFinanceiro = Joi.object({ /*filtros gerais: datas + barbeiro + serviço*/
  inicio: Joi.string().isoDate().allow('', null), /*data de inicio do filtro: é um texto (string), no formato ISO, e pode ser vazia/null*/
  fim: Joi.string().isoDate().allow('', null), /*data de fim do filtro: é um texto (string), no formato ISO, e pode ser vazia/null*/
  barbeiroId: Joi.number().integer().min(1).optional(), /*id do barbeiro: número, inteiro, mínimo 1, opcional*/
  servicoId: Joi.number().integer().min(1).optional() /*id do serviço: número, inteiro, mínimo 1, opcional*/
});

/*filtros para exportação pdf/csv (inclui tudo de schemaFinanceiro + tipo de tabela e formato)*/
const exportacaoSchema = schemaFinanceiro.keys({
  tipoTabela: Joi.string().valid('dia', 'barbeiro', 'servico').default('dia'), /*o valor de tipo tabela é: string, só aceita dia barbeiro ou serviço, se o usuário não enviar tipoTabela o valor padrão é "dia"*/
  formato: Joi.string().valid('csv', 'pdf').default('csv') /*o valor de formato é: string, só aceita pdf ou csv, se o usuário não enviar formato o valor padrão é "csv"*/
});

export { schemaFinanceiro, exportacaoSchema }; /*exporta o schemaFinanceiro e o exportacaoSchema para ser utilizado pelo service*/


