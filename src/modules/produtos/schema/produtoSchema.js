import Joi from 'joi'; /*importa o Joi - biblioteca de validação: define regras dos campos e valida o payload*/

const schemaProduto = Joi.object({ /*define o schema -formato e regras dos dados- de validação do produto*/
    nome: Joi.string().min(2).max(100).required(), /*nome: texto, 2–100, obrigatório*/
    categoria: Joi.string().min(2).max(60).required(), /*categoria: texto, 2–60, obrigatório*/
    quantidade: Joi.number().integer().min(0).required(), /*quantidade: número inteiro ≥ 0, obrigatório*/
    unidade: Joi.string().min(1).max(20), /*unidade: texto, 1–20, opcional*/
    validade: Joi.string().allow('', null).max(50), /*validade: texto opcional; pode ser '' ou null; máx. 50*/
    marca: Joi.string().allow('', null).max(60), /*marca: texto opcional; pode ser '' (vazio) ou null; máx. 60*/
    imagem: Joi.string().allow('', null), /*imagem: texto opcional (data URL/base64 ou URL); pode ser '' ou null*/
    descartavel: Joi.boolean().default(false), /*descartável: boolean; se não vier, vira false (default)*/
    ativo: Joi.boolean().default(true) /*ativo: boolean; se não vier, vira true (default)*/
});

export default schemaProduto; /*exporta o schema para ser utilizado pelo service*/

/*resumo: é o “contrato” de validação do produto: define tipos, obrigatoriedade, limites e defaults, limpa campos desconhecidos antes de salvar*/