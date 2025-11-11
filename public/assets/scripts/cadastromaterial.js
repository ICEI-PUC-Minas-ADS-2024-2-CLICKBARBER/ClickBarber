document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE = 'http://localhost:3000/api'; /*prefixo pra todas as chamadas*/

    /*HELPER HTTP*/
    async function http(method, path, body) { /*http monta o fetch, envia JSON quando tem body, tenta ler res.json(), lança erro se !res.ok*/
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        let data = null; try { data = await res.json(); } catch { }
        if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
        return data;
    }

    /*as três FUNÇÕES são atalhos para os endpoints de produto:*/
    const apiBuscarProduto = (id) => http('GET', `/produtos/${id}`);
    const apiCriarProduto = (payload) => http('POST', `/produtos`, payload);
    const apiAtualizarProduto = (id, p) => http('PUT', `/produtos/${id}`, p);

    /*FAZ A LINHA APARECER SEMPRE EMBAIXO DA OPÇÃO "produtos disponíveis", a não ser que outra opção seja selecionada no menu*/
    const menus = [ /*array com os 4 itens do menu*/
        document.getElementById("menuAgenda"),
        document.getElementById("menuMeuPlano"),
        document.getElementById("menuPerfil"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
    ];
    const menuProdutos = document.getElementById("menuProdutos");
    menus.forEach(menu => {
        if (!menu) return;
        menu.addEventListener("click", function () {
            menus.forEach(m => m && m.classList.remove("active"));
            this.classList.add("active"); /*adiciona a linha debaixo do que clicar*/
        });
    });
    if (menuProdutos) menuProdutos.classList.add("active"); /*deixa produtos já sempre marcado*/

    /*obtém o ELEMENTO <form> pelo ID*/
    const fomularioCadastro = "formMaterial";
    const form = document.getElementById(fomularioCadastro);
    if (!form) { /*se a página não tem esse form, o script não executa*/
        return;
    }

    /*impedir a inserção de uma VALIDADE menor que o dia que o cadastro está sendo realizado (no input)*/
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

    /*EDIÇÃO*/
    const params = new URLSearchParams(location.search); /*lê a query string da URL, busca o produto e preenche o formulário*/
    const idEdicao = params.get("id");
    let produtoEmEdicao = null;
    if (idEdicao) { /*se existe id na URL:*/
        try {
            produtoEmEdicao = await apiBuscarProduto(idEdicao); /*busca o produto na API*/
            const selUn = document.getElementById("unidade");
            if (selUn && produtoEmEdicao?.unidade && ![...selUn.options].some(o => o.value === produtoEmEdicao.unidade)) { //verifica se a unidade ja selecionada existe
                selUn.insertAdjacentHTML('beforeend', `<option value="${produtoEmEdicao.unidade}">${produtoEmEdicao.unidade}</option>`);
            }
            const categoriaSelectPreencher = document.getElementById("categoria");
            if (categoriaSelectPreencher && produtoEmEdicao?.categoria) { /*garante que a categoria dele exista no <select>*/
                const existe = [...categoriaSelectPreencher.options].some(
                    o => o.value === produtoEmEdicao.categoria
                );
                if (!existe) { /*se a categoria não existe no select, cria uma <option>*/
                    categoriaSelectPreencher.insertAdjacentHTML(
                        'beforeend',
                        `<option value="${produtoEmEdicao.categoria}">${produtoEmEdicao.categoria}</option>`
                    );
                }
            }
            /*preenche todos os campos do form durante a edição*/
            document.getElementById("nome").value = produtoEmEdicao.nome || "";
            document.getElementById("categoria").value = produtoEmEdicao.categoria || "";
            document.getElementById("marca").value = produtoEmEdicao.marca || "";
            document.getElementById("quantidade").value = Number(produtoEmEdicao.quantidade || 0);
            document.getElementById("unidade").value = produtoEmEdicao.unidade || "";
            document.getElementById("validade").value = produtoEmEdicao.validade || "";
            document.getElementById("ativo").checked = !!produtoEmEdicao.ativo;
            /*muda os textos da tela para contexto de edição*/
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.textContent = "Salvar alterações";
            const h1 = document.querySelector("h1");
            if (h1) h1.textContent = "Editar material";
        } catch (e) {
            alert("Não foi possível carregar o produto para edição.");
        }
    }

    /*SUBMIT DO FORMULÁRIO*/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        /*lê e formata os valores dos CAMPOS:*/
        const nome = document.getElementById("nome")?.value?.trim();
        const categoriaSelect = document.getElementById("categoria");
        let categoria = categoriaSelect?.value?.trim();
        const marca = document.getElementById("marca")?.value?.trim();
        const quantidade = Number(document.getElementById("quantidade")?.value || 0);
        const unidade = document.getElementById("unidade")?.value?.trim() || "";
        const validade = document.getElementById("validade")?.value?.trim() || "";
        const ativo = !!document.getElementById("ativo")?.checked;
        const descartavel = !!document.getElementById("descartavel")?.checked;
        const imgInput = document.getElementById("imagem");
        if (!nome || !categoria || document.getElementById("quantidade").value === '') { /*impede envio se esses 3 campos não estiverem preenchidos*/
            alert("Preencha: nome, categoria e quantidade.");
            return;
        }
        /*impedir a inserção de uma VALIDADE menor que o dia que o cadastro está sendo realizado (roda no submit, antes de salvar; impede que insira manualmente*/
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
        /*IMAGEM*/
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
        /*MONTA PAYLOAD*/
        const payload = {
            nome, categoria, marca, quantidade, unidade, validade, ativo, descartavel // pode ser null, string base64 ou URL
        };
        /*DECIDE CRIAR OU ATUALIZAR*/
        try {
            if (idEdicao && produtoEmEdicao) {
                if (novaImagem !== null) {
                    payload.imagem = novaImagem;
                }
                await apiAtualizarProduto(idEdicao, payload);
                alert("Alterações salvas!");

            } else {
                payload.imagem = novaImagem;
                await apiCriarProduto(payload);
                alert("Cadastrado!");
            }
            window.location.href = "produtos.html";
        } catch (err) {
            alert(err.message || "Falha ao salvar produto.");
        }
        //return; -> garante que não cai em nada depois
        /*REDIRECIONANDO*/
        window.location.href = "produtos.html"; /*retorna para a página inicial*/
    });
})