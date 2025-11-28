import produtoService from '../service/produtoService.js'; /*traz as regras de negócio/acesso a dados de produto (listar, criar, etc)*/

const produtoController = { /*objeto produtoController com métodos assíncronos. Cada método segue o padrão try/catch e, em caso de erro, chama next(e) para o middleware de erro tratar*/

  async list(req, res, next) { /*lê filtros vindos da URL, pede ao service a lista filtrada, responde 200 com JSON da lista (200 = status HTTP 200 OK)*/
    try {
      const { search, categoria, ativo, descartavel } = req.query;
      const out = await produtoService.list({ search, categoria, ativo, descartavel });
      res.json(out);
    } catch (e) { next(e); }
  },

  async get(req, res, next) { /*busca um produto pelo id da rota. Se não achar, erro 404. Se achar, 200 com o produto*/
    try {
      const p = await produtoService.find(req.params.id);
      if (!p) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json(p);
    } catch (e) { next(e); }
  },

  async create(req, res, next) { /*recebe os dados no corpo (JSON), cria via service, esponde 201 Created com o registro criado*/
    try {
      const novo = await produtoService.create(req.body);
      res.status(201).json(novo);
    } catch (e) { next(e); }
  },

  async update(req, res, next) { /*atualiza o produto id com dados do corpo. Retorna 200 com o produto atualizado (ou o que o service devolver)*/
    try {
      const upd = await produtoService.update(req.params.id, req.body);
      res.json(upd);
    } catch (e) { next(e); }
  },

  async remove(req, res, next) { /*remove o produto id. Responde 204 No Content (sem corpo)*/
    try {
      await produtoService.remove(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  },

  async categorias(req, res, next) { /*pede ao service a lista de categorias disponíveis. Responde 200 com o array*/
    try {
      const cats = await produtoService.categorias();
      res.json(cats);
    } catch (e) { next(e); }
  }
};

export default produtoController; /*disponibiliza o controller para ser usado nas rotas*/

/*resumindo: recebe a requisição, extrai parâmetros/corpo, chama o produtoService e monta respostas HTTP, delegando erros para o as funções centrais de tratamento de erro. Os códigos de status HTTP são padrão.*/