document.addEventListener("DOMContentLoaded", function () {

    /*DECLARANDO VARIÁVEIS E VALORES*/
    const opcaoServico = document.getElementById("fundoOpcaoDeCima");
    const titulo = document.getElementById("tituloPrimeiraTela");
    const opcoesIniciais = document.querySelectorAll(".fundoOpcoes");
    const blocoServicos = document.getElementById("opcoesServico");
    const blocoTodosMateriais = document.getElementById("blocoTodosMateriais");
    const blocoMateriaisPorServico = document.getElementById("blocoMateriaisPorServico");


    /*FAZ A LINHA APARECER EMBAIXO DO MENU*/
    const menus = [ /*array com os 4 itens do menu*/
        document.getElementById("menuAgenda"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
        document.getElementById("menuPlano")
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


    /*FAZ VOLTAR PARA A TELA INICIAL SEMPRE QUE CLICAR NA LOGO*/
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
    if (verTodosMateriais) {
        verTodosMateriais.addEventListener("click", () => {
            titulo.style.display = "none";
            opcoesIniciais.forEach(div => div.style.display = "none");
            blocoServicos.style.display = "none";
            if (blocoMateriaisPorServico) blocoMateriaisPorServico.style.display = "none";
            blocoTodosMateriais.style.display = "block";
            cardProdutos(lerListaProdutos()); /*+ carrega na tela os cards de todos os produtos lidos do localStorage*/
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
    document.addEventListener("click", (e) => { /*evento de clique*/
        const btn = e.target.closest(".btn-excluir"); /*verifica se o clique foi no botão de exluir*/
        if (!btn) { /*se não foi, não executa*/
            return;
        }
        const id = Number(btn.dataset.id); /*lê o ID do produto*/
        if (!id) { /*se não tiver, não executa*/
            return;
        }
        if (!confirm("Tem certeza que deseja excluir este produto?")) return; /*pede confirmação*/
        const lista = lerListaProdutos(); /*lê todos os produtos do localStorage*/
        const nova = lista.filter(p => p.id !== id); /*remove o produto com aquele ID*/
        salvarProdutos(nova); /*salva a lista sem o item*/
        if (blocoTodosMateriais.style.display === "block") { /*se estiver na tela de todos, recarrega todos*/
            cardProdutos(lerListaProdutos());
        } else if (blocoMateriaisPorServico.style.display === "block" && categoriaAtual) { /*se estiver na tela de categoria, recarrega a categoria atual*/
            desenharPorCategoria(categoriaAtual);
        }
    });

    function salvarProdutos(produtos) { /*converte o array para JSON e salva na chave chaveBusca do localStorage*/
        localStorage.setItem(chaveBusca, JSON.stringify(produtos));
    }

    /*PUXANDO OS PRODUTOS*/
    /*declarando variáveis e valores*/
    const chaveBusca = "produtosJson";
    const selCategoria = document.getElementById("filtroCategoria");
    const btnTodos = document.getElementById("btnTodos");
    const lista = document.getElementById("lista")?.querySelector(".row"); /*row onde todos os cards serão inseridos*/
    const listaPorServico = document.getElementById("blocoMateriaisPorServico")?.querySelector(".container .row"); /*row onde os cards por categoria serão inseridos*/
    function lerListaProdutos() { /*tenta ler e fazer JSON.parse do localStorage, se falhar, retorna vazio*/
        try {
            return JSON.parse(localStorage.getItem(chaveBusca)) || [];
        }
        catch {
            return [];
        }
    }
    function limparRow(row) { /*apaga todo o conteúdo de uma row antes de redesenhar*/
        if (row) row.innerHTML = "";
    }


    /*RETORNA A LISTA DE CATEGORIAS*/
    function categoriasUnicas() {
        const todos = lerListaProdutos(); /*busca todos os produtos em localStorage*/
        const set = new Set(
            todos.map(p => (p.categoria || "").trim()).filter(Boolean) /*pega as categorias*/
        );
        return Array.from(set).sort(); /*retorna o nome das categorias*/
    }
    function montarServicosDinamicos() { /*função que cria, no HTML, os “cards/opções” de serviço*/
        const container = document.getElementById("opcoesServico"); /*pega o container das opções de serviços*/
        if (!container) { /*se não existir, encerra*/
            return;
        }
        const existentes = new Set( /*cria um set com as categorias para não repetir*/
            Array.from(container.querySelectorAll(".fundoOpcoesServico p")) /*seleciona o p dentro do container - palavra*/
                .map(p => (p.textContent || "").trim().toLowerCase())
        );
        categoriasUnicas().forEach(cat => { /*adiciona as categorias que ainda não tem*/
            if (existentes.has(cat.toLowerCase())) { /*se a categoria já existe, não insere*/
                return;
            }
            const div = document.createElement("div"); /*cria a div*/
            div.className = "fundoOpcoesServico"; /*aplica a classe*/
            div.innerHTML = `<p>${cat}</p>`; /*aplica o nome*/
            container.appendChild(div); /*insere no bloco categorias*/
        });
    }
    montarServicosDinamicos(); /*chamando a função*/


    /*PREENCHENDO OS CARDS*/
    function cardHTML(p) {
        const statusClass = p.ativo ? "btn-success" : "btn-danger"; /*define o botão verde p/bool true e vermelho p/ bool false*/
        const statusText = p.ativo ? "DISPONÍVEL" : "INDISPONÍVEL";
        /*retorna uma string html do card*/
        return ` 
          <div class="card h-100">
            ${p.imagem
                ? `<img src="${p.imagem}" class="card-imagem" alt="Imagem do produto">`
                : `<div class="card-imagem d-flex align-items-center justify-content-center" style="height:180px;background:#efefef;color:#777;">Sem imagem</div>`}
            <div class="card-body d-flex flex-column">
              <hr class="bg-light">
              <h5 class="card-title">${p.nome}</h5>
              <ul class="mb-3 ps-3">
                <li><strong>Quantidade:</strong> ${p.quantidade}${p.unidade ? " " + p.unidade : ""}</li>
                <li><strong>Marca:</strong> ${p.marca}</li>
                <li><strong>Categoria:</strong> ${p.categoria}</li>
                <li><strong>Validade:</strong> ${p.validade || "—"}</li>
              </ul>
              <div class="mt-auto">
                <button type="button" class="btn btn-sm ${statusClass}" disabled>${statusText}</button>
                <!-- AÇÕES -->
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


    /*CARREGA TODOS OS PRODUTOS*/
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

    const dados = lerListaProdutos(); /*lê os produtos no localStorage*/

    /*PREENCHENDO OS CARDS*/
    function desenharPorCategoria(categoria) {
        if (!listaPorServico) { /*se não há row em serviços, não roda*/
            return;
        }
        limparRow(listaPorServico); /*limpa  arow antes de inserir os produtos*/
        const dados = lerListaProdutos().filter( /*lê os produtos e filtra pela categoria selecionada*/
            p => (p.categoria || "").toLowerCase() === (categoria || "").toLowerCase()
        );
        if (!dados.length) { /*se não há produtos para aquela categoria, avisa:*/
            listaPorServico.innerHTML = `<div class="col-12"><div class="alert alert-secondary">Nenhum produto em "${categoria}".</div></div>`;
            return;
        }
        const header = document.createElement("div"); /*título com qual categoria está sendo exibida*/
        header.className = "col-12";
        header.innerHTML = `<div class="category-title">Produtos da categoria “${categoria}”</div>`;
        listaPorServico.appendChild(header);
        dados.forEach(p => { /*para cada produtdo da categoria cria uma coluna e insere o card*/
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";
            col.innerHTML = cardHTML(p);
            listaPorServico.appendChild(col);
        });
    }
});