const API_BASE = 'http://localhost:3000/api'; /*endereço raiz da API. Tudo que eu chamar abaixo será prefixado por isso*/

async function http(method, path, body, params = {}) { /*função genérica http*/
    const url = new URL(`${API_BASE}${path}`); /*monta a URL*/
    Object.entries(params).forEach(([k, v]) => { /*só coloca o filtro na URL se ele realmente tiver um valor*/
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    /*monta as opções do fetch - função para fazer requisições HTTP*/
    const opt = { method, headers: { 'Content-Type': 'application/json' } }; /*define o método HTTP e o header de JSON*/
    if (body !== undefined) opt.body = JSON.stringify(body); /*se houver body, transforma em JSON string (para POST/PUT)*/
    /*faz a requisição e tenta ler o JSON*/
    const res = await fetch(url, opt); /*se a resposta não tiver corpo, o json() falha; o try/catch evita erro e deixa data = null:*/
    let data = null;
    try { data = await res.json(); } catch { }
    /*erros HTTP viram exceção*/
    if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`); /*se o status não for um código HTTP de sucesso, lança erro*/
    return data; /*se for sucesso, retorna o JSON*/
}

/*funções específicas de produto. Mapeiam cada endpoint REST -ponto de acesso da API, combinação de método HTTP + URL- do backend*/
function apiListarProdutos(params = {}) { return http('GET', '/produtos', undefined, params); } /*faz GET /produtos com filtros na query e retorna a lista de produtos. Aceita filtros via params*/
function apiBuscarProduto(id) { return http('GET', `/produtos/${id}`); } /*faz GET /produtos/:id e retorna um produto específico*/
function apiCriarProduto(payload) { return http('POST', '/produtos', payload); } /*faz POST /produtos enviando o corpo JSON e retorna o produto criado*/
function apiAtualizarProduto(id, p) { return http('PUT', `/produtos/${id}`, p); } /*faz PUT /produtos/:id com dados atualizados e retorna o produto atualizado*/
function apiExcluirProduto(id) { return http('DELETE', `/produtos/${id}`); } /*faz DELETE /produtos/:id e, em sucesso, retorna null (porque o servidor responde 204)*/
function apiCategorias() { return http('GET', '/produtos/categorias'); } /*faz GET /produtos/categorias e retorna a lista de categorias únicas*/

/*resumo: monta URL com filtros, envia/recebe JSON, converte erros HTTP em exceção e expõe funções prontas para CRUD de produtos e listagem de categorias*/
