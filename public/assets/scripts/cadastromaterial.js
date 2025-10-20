document.addEventListener("DOMContentLoaded", function () {

    /*FAZ A LINHA APARECER SEMPRE EMBAIXO DA OPÇÃO "produtos disponíveis", a não ser que outra opção seja selecionada no menu*/
    const menus = [ /*array com os 4 itens do menu*/
        document.getElementById("menuAgenda"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
        document.getElementById("menuPlano")
    ];
    menus.forEach(menu => {
        if (!menu) return;
        menu.addEventListener("click", function () {
            menus.forEach(m => m && m.classList.remove("active"));
            this.classList.add("active"); /*adiciona a linha debaixo do que clicar*/
        });
    });
    if (menuProdutos) menuProdutos.classList.add("active"); /*deixa produtos já sempre marcado*/


    /*FORMULÁRIO DE PRODUTOS*/

    /*se o usuário quiser cadastrar outra categoria*/
    const selectCategoria = document.getElementById("categoria");
    const campoOutra = document.getElementById("campoOutraCategoria");
    const inputOutra = document.getElementById("categoriaOutra");
    if (selectCategoria && campoOutra && inputOutra) { /*se os três elementos existirem*/
        selectCategoria.addEventListener("change", () => {
            if (selectCategoria.value === "__outra__") {
                campoOutra.classList.remove("d-none"); /*mostra o campo “outra” removendo d-none*/
                inputOutra.required = true; /*exige uma entrada quando for "outra"*/
                inputOutra.focus();
            } else { /*caso outra opção a não ser "outra" seja selecionada*/
                campoOutra.classList.add("d-none"); /*esconde novamente o campo*/
                inputOutra.required = false;
                inputOutra.value = "";
            }
        });
    }


    /*referências*/
    const fomularioCadastro = "formMaterial";
    const chaveBusca = "produtosJson"; /*chave usada no localStorage para salvar/ler os produtos*/
    const form = document.getElementById(fomularioCadastro);
    if (!form) { /*se a página não tem esse form, o script não executa*/
        return;
    }
    /*impedir a inserção de uma validade menor que o dia que o cadastro está sendo realizado*/
    const validadeEntrada = document.getElementById("validade");
    if (validadeEntrada) { /*se essa constante não existir, não executa*/
        const hoje = new Date(); /*cria um objeto Date com a data e hora atuais do meu navegador*/
        const yyyy = hoje.getFullYear(); /*extrai o ano - 4 dígitos*/
        const mm = String(hoje.getMonth() + 1).padStart(2, "0"); /*pega o mês; vai de 0 a 11, então soma + 1 para ficar de 1 a 12. Converte para string e garante sempre dois dígitos (ex.: 3 vira 03)*/
        const dd = String(hoje.getDate()).padStart(2, "0"); /*pega o dia do mês, converte pra string e completa com zero à esquerda (ex.: 3 vira 03)*/
        const hojeStr = `${yyyy}-${mm}-${dd}`; /*monta a data no formato ISO (ex.: "2025-10-20")*/
        validadeEntrada.min = hojeStr; /*define o atributo HTML min do input de data, impedindo seleção de datas anteriores a hoje*/
        validadeEntrada.addEventListener("input", () => { /*define o evento entrada - RODA NO INPUT - impede que selecione no calendário*/
            if (validadeEntrada.value && validadeEntrada.value < hojeStr) { /*se a entrada não está vazia && se a data é menor que "hoje"*/
                validadeEntrada.setCustomValidity("A validade não pode ser anterior a hoje.");
            } else {
                validadeEntrada.setCustomValidity(""); /*se estiver tudo certo, nada acontece*/
            }
        });
    }
    /*ler e salvar no localStorage*/
    function lerListaProdutos() { /*lê a lista do localStorage*/
        try {
            return JSON.parse(localStorage.getItem(chaveBusca)) || []; /*busca a string salva na chave, converte a string (json) para um valor js || se o resultado do parse for false, retorna vazio*/
        }
        catch {
            return []; /*se a entrada for inválida, lança erro*/
        }
    }
    function salvarProdutos(listaProdutos) { /*salva a lista convertida em JSON no localStorage*/
        localStorage.setItem(chaveBusca, JSON.stringify(listaProdutos));
    }
    const params = new URLSearchParams(location.search); /*lê a query string da URL*/
    /*editando*/
    const idEdicao = params.get("id"); /*se existir id na URL, significa que eu estou editando um produto*/
    let produtoEmEdicao = null; /*variável para guardar o produto carregado para edição*/
    if (idEdicao) { /*se tem id na URL*/
        const lista = lerListaProdutos(); /*lê a lista completa do storage*/
        produtoEmEdicao = lista.find(p => String(p.id) === String(idEdicao)); /*procura na lista o item com id igual ao id da URL (ambos convertidos para string para não dar problema)*/
        if (produtoEmEdicao) { /*preenche os campos do formulário com os dados do produto encontrado*/
            document.getElementById("nome").value = produtoEmEdicao.nome || ""; /*se algo não for preenchido, retorna string vazia*/
            document.getElementById("categoria").value = produtoEmEdicao.categoria || "";
            document.getElementById("marca").value = produtoEmEdicao.marca || "";
            document.getElementById("quantidade").value = Number(produtoEmEdicao.quantidade || 0);
            document.getElementById("unidade").value = produtoEmEdicao.unidade || "";
            document.getElementById("validade").value = produtoEmEdicao.validade || "";
            document.getElementById("ativo").checked = !!produtoEmEdicao.ativo; /*força booleano*/
            const btn = form.querySelector('button[type="submit"]'); /*procura dentro do form o botão de submit*/
            if (btn) { /*se esse botão existir*/
                btn.textContent = "Salvar alterações"; /*textContent troca o texto visível do botão (não mexe no html)*/
            }
            const h1 = document.querySelector("h1"); /*pega o h1 da página*/
            if (h1) { /*se houver*/
                h1.textContent = "Editar material"; /*muda o título*/
            }
        }
    }
    /*submissão do formulário*/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        /*lê e formata os valores dos campos:*/
        const nome = document.getElementById("nome")?.value?.trim();
        const categoriaSelect = document.getElementById("categoria");
        let categoria = categoriaSelect?.value?.trim();
        if (categoria === "__outra__") { /*se a opção "outra" for selecionada*/
            const outra = document.getElementById("categoriaOutra")?.value?.trim(); /*lê a categoria digitada*/
            categoria = outra || ""; /*se não digitar nada, retorna vazio*/
        }
        const marca = document.getElementById("marca")?.value?.trim();
        const quantidade = Number(document.getElementById("quantidade")?.value || 0);
        const unidade = document.getElementById("unidade")?.value?.trim() || "";
        const validade = document.getElementById("validade")?.value?.trim() || "";
        const ativo = !!document.getElementById("ativo")?.checked;
        const imgInput = document.getElementById("imagem");
        if (!nome || !categoria || !marca || !quantidade) { /*impede envio se esses 4 campos não estiverem preenchidos*/
            alert("Preencha: nome, categoria, marca e quantidade.");
            return;
        }
        /*impedir a inserção de uma validade menor que o dia que o cadastro está sendo realizado (roda no submit, antes de salvar; impede que insira manualmente*/
        {
            /*mesmo esquema do outro*/
            const hoje = new Date();
            const yyyy = hoje.getFullYear();
            const mm = String(hoje.getMonth() + 1).padStart(2, "0");
            const dd = String(hoje.getDate()).padStart(2, "0");
            const hojeStr = `${yyyy}-${mm}-${dd}`;
            if (validade && validade < hojeStr) {
                alert("Data de validade inválida. Selecione uma data a partir de hoje.");
                return;
            }
        }
        /*imagem*/
        const novaImagem = await new Promise(resolve => { /*editando a imagem*/
            if (imgInput?.files?.[0]) { /*tenta ler o arquivo selecionado*/
                const r = new FileReader(); /*se houver arquivo, converte em data url*/
                r.onload = () => resolve(r.result);
                r.onerror = () => resolve(null); /*mantem a imagem antiga ao editar, se a leitura falhar*/
                r.readAsDataURL(imgInput.files[0]);
            }
            else {
                resolve(null); /*se não houver arquivo, retorna null*/
            }
        });
        const lista = lerListaProdutos(); /*carrega a lista atual do storage para poder inserir/alterar*/
        if (idEdicao && produtoEmEdicao) { /*se tiver idEdicao e o produto for encontrado*/
            const idx = lista.findIndex(p => String(p.id) === String(idEdicao)); /*procura a posição do produto a editar dentro do array, comparando IDs como string*/
            if (idx >= 0) { /*se o produto foi encontrado no array*/
                lista[idx] = { /*sobrescreve o objeto na posição idx com:*/
                    ...lista[idx], /*lista[idx]: mantém todos os campos antigos*/
                    nome, categoria, marca, quantidade, unidade, validade, ativo, /*e atualiza os campos vindos do formulário*/
                    imagem: novaImagem !== null ? novaImagem : lista[idx].imagem /*se a nova imagem for !== null, usa a nova, senão, mantém a anterior*/
                };
                salvarProdutos(lista); /*converte o array para JSON e salva no localStorage*/
                alert("Alterações salvas!");
            }
        } else { /*se não for edição*/
            /*cadastrando*/
            const produto = { /*novo produto*/
                id: Date.now(), /*cria um ID*/
                nome, categoria, marca, quantidade, unidade, validade, ativo,
                imagem: novaImagem
            };
            lista.push(produto); /*adiciona o novo produto no array*/
            salvarProdutos(lista); /*salva no localStorage*/
            alert("Cadastrado!");
        }
        /*redirecionando*/
        window.location.href = "produtos.html"; /*retorna para a página inicial*/
    });
})