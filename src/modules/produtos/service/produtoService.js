import schemaProduto from '../schema/produtoSchema.js'; /*schemaProduto: regras de validação dos campos (ex.: nome, quantidade, etc)*/
import produtoRepositoryMySQL from '../repository/produtoRepository.mysql.js'; /*pega o export do produtoRepository.mysql.js*/

const repo = produtoRepositoryMySQL; /*usa sempre o repositório MySQL*/

const produtoService = { /*regras de negócio*/

  list: (filtros) => repo.list(filtros), /*repassa filtros para o repositório e retorna os itens*/

  find: (id) => repo.findById(id), /*busca um produto pelo id*/

  create: async (payload) => {
    const { error, value } = schemaProduto.validate(payload, { stripUnknown: true }); /*valida o payload com o schema e remove campos não reconhecidos*/
    if (error) { /*se inválido lança erro 400 com a mensagem de validação*/
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    return repo.create(value); /*se tudo ok, chama repo.create(value) com os dados limpos*/
  },

  update: async (id, payload) => {
    const atual = await repo.findById(id);
    if (!atual) { /*garante que o produto existe; se não, 404*/
      const err = new Error('Produto não encontrado');
      err.status = 404;
      throw err;
    }
    const { error, value } = schemaProduto.validate({ ...atual, ...payload }, { stripUnknown: true }); /*une o estado atual com o payload (alterações) para validar o conjunto completo após a atualização. Valida com o schema (removendo campos desconhecidos)*/
    if (error) { /*se inválido, 400*/
      const err = new Error(error.details[0].message);
      err.status = 400;
      throw err;
    }
    return repo.update(id, value); /*se estiver ok, chama o repositório para atualizar o produto de id informado com os dados já validados*/
  },

  remove: async (id) => { /*tenta apagar; o repositório retorna se deu certo ou não*/
    const ok = await repo.delete(id);
    if (!ok) { /*se não apagou (não existia), 404*/
      const err = new Error('Produto não encontrado');
      err.status = 404;
      throw err;
    }
    return true; /*se apagou, retorna true (o controller responde 204)*/
  },

  categorias: () => repo.categorias() /*pede ao repositório a lista (sem duplicados) de categorias*/

};

export default produtoService; /*disponibiliza o service para o controller usar*/

/*resumo: aplica regras de negócio (validar, normalizar, decidir status de erro) e delega ao repositório a leitura/escrita dos produtos*/
/*obs.: 404 é o código de status HTTP “Not Found” (não encontrado)*/