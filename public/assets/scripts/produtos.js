document.addEventListener("DOMContentLoaded", function () {

    const API_BASE = 'http://localhost:3000/api'; /*prefixo pra todas as chamadas*/

    /*HELPER HTTP*/
    async function http(method, path, body, params = {}) { /*monta a URL e só adiciona query params que têm valor, envia JSON quando tem body, tenta ler res.json(), lança erro se !res.ok*/
        const url = new URL(`${API_BASE}${path}`);
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
        });
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        let data = null; try { data = await res.json(); } catch { }
        if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
        return data;
    }

    /*ATALHOS PARA ENDPOINTS DE PRODUTO (facilitam chamar a API)*/
    const apiListarProdutos = (params = {}) => http('GET', '/produtos', undefined, params);
    const apiBuscarProduto = (id) => http('GET', `/produtos/${id}`);
    const apiExcluirProduto = (id) => http('DELETE', `/produtos/${id}`);
    const apiCategorias = () => http('GET', '/produtos/categorias');

    /*OBTENDO ELEMENTOS DAS PÁGINAS E DECLARANDO VARIÁVEIS E VALORES*/
    const opcaoServico = document.getElementById("fundoOpcaoDeCima");
    const titulo = document.getElementById("tituloPrimeiraTela");
    const opcoesIniciais = document.querySelectorAll(".fundoOpcoes");
    const blocoServicos = document.getElementById("opcoesServico");
    const blocoTodosMateriais = document.getElementById("blocoTodosMateriais");
    const blocoMateriaisPorServico = document.getElementById("blocoMateriaisPorServico");

    /*FAZ A LINHA APARECER EMBAIXO DO MENU*/
    const menus = [ /*array com os 4 itens do menu*/
        document.getElementById("menuAgenda"),
        document.getElementById("menuMeuPlano"),
        document.getElementById("menuPerfil"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
    ];
    menus.forEach(menu => {
        menu.addEventListener("click", function () {
            menus.forEach(m => m.classList.remove("active"));
            this.classList.add("active"); /*adiciona a linha no opção selecionada*/
        });
    });

    /*FAZ A OPÇÃO "PRODUTOS DISPONÍVEIS" VOLTAR PARA A TELA INICIAL*/
    const menuProdutos = document.getElementById("menuProdutos");
    if (menuProdutos) {
        menuProdutos.addEventListener("click", (e) => { /*ao clicar na oção menu produtos*/
            e.preventDefault();
            blocoServicos.style.display = "none"; /*esconde o bloco de serviços*/
            blocoTodosMateriais.style.display = "none"; /*esconde o bloco de todos os materiais*/
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none"; /*esconde o bloco de por serviço, se existir*/
            opcoesIniciais.forEach(div => (div.style.display = "block")); /*mostra os blocos das opções iniciais/página inicial*/
            titulo.style.display = "block"; /*mostra o título da tela inicial*/
        });
    }

    /*BOTÃO QUE FAZ VOLTAR PARA A TELA DE SERVIÇOS*/
    document.querySelectorAll(".btnVoltarParaServicos").forEach(btn => { /*seleciona todos os botões “Voltar para serviços”*/
        btn.addEventListener("click", (e) => { /*ao clicar no botão*/
            e.preventDefault();
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none"; /*esconde o bloco materiais por serviço, se existir*/
            blocoTodosMateriais.style.display = "none"; /*esconde o bloco todos os materiais por serviço, se existir*/
            titulo.style.display = "none"; /*esconde o título da primeira tela*/
            opcoesIniciais.forEach(div => div.style.display = "none"); /*esconde as opções da tela inicial*/
            blocoServicos.style.display = "block"; /*mostra as categorias de serviços para o usuário escolher*/
        });
    });

    /*BOTÃO VOLTAR LEVANDO PARA A TELA INICIAL*/
    document.querySelectorAll(".btnVoltar").forEach(btn => { /*mesma lógica*/
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            blocoServicos.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            titulo.style.display = "block";
            opcoesIniciais.forEach(div => (div.style.display = "block"));
        });
    });

    /*LOGO FAZ VOLTAR PARA A TELA INICIAL SEMPRE QUE CLICA*/
    const logo = document.querySelector(".navbar-brand"); /*mesma lógica*/
    if (logo) {
        logo.addEventListener("click", (e) => {
            e.preventDefault();
            blocoServicos.style.display = "none";
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            titulo.style.display = "block";
            opcoesIniciais.forEach(div => (div.style.display = "block"));
        });
    }

    /*FAZ A OPÇÃO "PRODUTOS DISPONÍVEIS" FICAR SEMPRE COM A LINHA EMBAIXO*/
    menus.forEach(m => m && m.classList.remove("active"));
    if (menuProdutos) menuProdutos.classList.add("active"); /*define active especificamente na opção produtos*/

    /*FAZ TUDO DESAPARECER AO CLICAR EM "POR SERVIÇO" E MOSTRA OS SERVIÇOS DISPONÍVEIS*/
    if (opcaoServico) { /*mesma lógica*/
        opcaoServico.addEventListener("click", () => {
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoTodosMateriais.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoServicos.style.display = "block";
        });
    }

    /*FAZ TUDO DESAPARECER AO CLICAR EM "VER TODOS OS MATERIAIS" E MOSTRA OS MATERIAIS*/
    const verTodosMateriais = document.getElementById("verTodosMateriais"); /*mesma lógica +*/
    /*chama o backend e desenha os cards*/
    if (verTodosMateriais) {
        verTodosMateriais.addEventListener("click", async () => {
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoServicos.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoTodosMateriais.style.display = "block";
            // buscar no backend:
            const produtos = await apiListarProdutos();
            cardProdutos(produtos);
        });
    }

    /*FAZ TUDO DESAPARECER AO CLICAR EM UMA OPÇÃO DE SERVIÇO E MOSTRA OS MATERIAIS DE ACORDO COM A OPÇÃO SELECIONADA*/
    const containerServicos = document.getElementById("opcoesServico"); /*mesma lógica +*/
    if (containerServicos) {
        containerServicos.addEventListener("click", (e) => {
            const card = e.target.closest(".fundoOpcoesServico");
            if (!card) return;
            const categoria = (card.textContent || "").trim(); /*+ obtém o texto do card (nome da categoria)*/
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoTodosMateriais.style.display = "none";
            blocoServicos.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "block";
            categoriaAtual = categoria; /*+ guarda a categoria atual/selecionada*/
            desenharPorCategoria(categoria); /*+ carrega na tela os cards filtrados pela categoria*/
        });
    }

    let categoriaAtual = null; /*para lembrar qual categoria está aberta no momento e me nela mesmo após ações, como excluir*/

    /*EXCLUIR*/
    document.addEventListener("click", async (e) => { /*só reage ao clique no botão excluir*/
        const btn = e.target.closest(".btn-excluir"); /*pega botão excluir*/
        if (!btn) return; /*se não clicar em excluir, ignora*/
        const id = Number(btn.dataset.id); /*pea o id*/
        if (!id) return; /*se não existir, ignora*/
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await apiExcluirProduto(id);
            alert("Produto excluído.");
        } catch (err) {
            alert(err.message || "Falha ao excluir");
        }
    });

    /*PUXANDO OS PRODUTOS*/
    /*declarando variáveis e valores*/
    const selCategoria = document.getElementById("filtroCategoria");
    const btnTodos = document.getElementById("btnTodos");
    const lista = document.getElementById("lista")?.querySelector(".row"); /*row onde todos os cards serão inseridos*/
    const listaPorServico = document.getElementById("blocoMateriaisPorServico")?.querySelector(".container .row"); /*row onde os cards por categoria serão inseridos*/
    function limparRow(row) { /*apaga todo o conteúdo de uma row antes de redesenhar*/
        if (row) row.innerHTML = "";
    }

    /*RETORNA A LISTA DE CATEGORIAS*/
    async function categoriasUnicas() { /*busca as categorias da API*/
        const cats = await apiCategorias();
        return Array.isArray(cats) ? cats : [];
    }
    async function montarServicosDinamicos() {
        const container = document.getElementById("opcoesServico");
        if (!container) return;
        const existentes = new Set( /*compara com as que já existem no HTML para não duplicar*/
            Array.from(container.querySelectorAll(".fundoOpcoesServico p"))
                .map(p => (p.textContent || "").trim().toLowerCase())
        );
        const cats = await categoriasUnicas();
        cats.forEach(cat => {
            if (existentes.has(String(cat).toLowerCase())) return;
            const div = document.createElement("div");
            div.className = "fundoOpcoesServico";
            div.innerHTML = `<p>${cat}</p>`;
            container.appendChild(div);
        });
    }
    (async () => { await montarServicosDinamicos(); })(); /*cria cards .fundoOpcoesServico novos para categorias que faltam. Chamar de forma assíncrona*/

    /*PREENCHENDO OS CARDS*/
    function cardHTML(p) {
        const ehDescartavel = !!p.descartavel;
        const ativo = !!p.ativo;
        const qtd = Number(p.quantidade || 0);
        const disponivel = ativo && (ehDescartavel ? qtd > 0 : true); /*define disponibilidade visual baseada nos campos do produto*/
        const statusClass = disponivel ? "btn-success" : "btn-danger";
        const statusText = disponivel ? "DISPONÍVEL" : "INDISPONÍVEL";
        /*html dos cards*/
        return `
          <div class="card h-100">
            ${p.imagem
                ? `<img src="${p.imagem}" class="card-imagem" alt="Imagem do produto">`
                : `<div class="card-imagem d-flex align-items-center justify-content-center" style="height:180px;background:#none;color:#777;">Sem imagem</div>`}
            <div class="card-body d-flex flex-column">
              <hr class="bg-light">
              <h5 class="card-title d-flex align-items-center">${p.nome}</h5>
              <ul class="mb-3 ps-3">
                <li><strong>Quantidade:</strong> ${p.quantidade}${p.unidade ? " " + String(p.unidade).replace(/\(s\)+$/i, '(s)') : ""}</li>
                <li><strong>Marca:</strong> ${p.marca || "—"}</li>
                <li><strong>Categoria:</strong> ${p.categoria || "—"}</li>
                <li><strong>Descartável:</strong> ${ehDescartavel ? "Sim" : "Não"}</li>
                <li><strong>Validade:</strong> ${p.validade || "—"}</li>
              </ul>
              <div class="mt-auto d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-sm ${statusClass}" disabled>${statusText}</button>
                <a href="cadastromaterial.html?id=${p.id}" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-pencil"></i> Editar
                </a>
                <button type="button" class="btn btn-outline-danger btn-sm btn-excluir" data-id="${p.id}">
                  <i class="bi bi-trash"></i> Excluir
                </button>
              </div>
            </div>
          </div>`;
    }

    /*DESENHA A LISTA TODOS OS PRODUTOS*/
    function cardProdutos(produtos) { /*carrega a lista completa de todos os produtos na row lista*/
        if (!lista) { /*se não encontrou a row, não roda*/
            return;
        }
        lista.innerHTML = ""; /*limpa a row antes de "desenhar"*/
        if (!produtos.length) { /*se não tiver produto, mostra esse alerta:*/
            lista.innerHTML = `<div class="col-12"><div class="alert alert-secondary">Sem produtos.</div></div>`;
            return;
        }
        const header = document.createElement("div"); /*cria e insere o título "todos os produtos"*/
        header.className = "col-12";
        header.innerHTML = `
      <h5 class="section-title h5 d-flex align-items-center gap-2 py-2 px-2 mb-2 border rounded bg-body-secondary">
        <i class="bi bi-box-seam"></i>
        <span>Todos os produtos</span>
      </h5>`;
        lista.appendChild(header);
        produtos.forEach(p => { /*para cada produto, cria uma coluna e insere o HTML do card*/
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";
            col.innerHTML = cardHTML(p);
            lista.appendChild(col);
        });
    }

    /*FILTRAR/DESENHAR POR CATEGORIA*/
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } /*deixa o texto minúsculo e sem acentos para comparar*/
    async function desenharPorCategoria(categoria) {
        if (!listaPorServico) return;
        limparRow(listaPorServico);
        const nome = norm(categoria);
        const params = {};
        if (nome === "descartaveis") { /*trata “Descartáveis/Não descartáveis” mapeando para o filtro descartavel=true/false*/
            params.descartavel = true;
        } else if (nome === "nao descartaveis" || nome === "nao descartáveis" || nome === "não descartaveis") {
            params.descartavel = false;
        } else {
            params.categoria = categoria; // usa o texto da etiqueta como veio
        }
        const dados = await apiListarProdutos(params); /*para outras categorias, envia categoria direto e o backend filtra.*/
        /*monta os cards da seção por serviço*/
        if (!dados.length) {
            listaPorServico.innerHTML = `<div class="col-12"><div class="alert alert-secondary">Nenhum produto em "${categoria}".</div></div>`;
            return;
        }
        const header = document.createElement("div");
        header.className = "col-12";
        header.innerHTML = `<div class="category-title">Produtos da categoria “${categoria}”</div>`;
        listaPorServico.appendChild(header);
        dados.forEach(p => {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";
            col.innerHTML = cardHTML(p);
            listaPorServico.appendChild(col);
        });
    }
});