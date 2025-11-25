document.addEventListener("DOMContentLoaded", async function () {

    /*FAZ A LINHA APARECER SEMPRE EMBAIXO DA OPÇÃO "financeiro", a não ser que outra opção seja selecionada no menu*/
    const menus = [ /*array com os 6 itens do menu*/
        document.getElementById("menuAgenda"),
        document.getElementById("menuFinanceiro"),
        document.getElementById("menuMeuPlano"),
        document.getElementById("menuPerfil"),
        document.getElementById("menuProdutos"),
        document.getElementById("menuServicos"),
    ];
    const menuFinanceiro = document.getElementById("menuFinanceiro");
    menus.forEach(menu => {
        if (!menu) return;
        menu.addEventListener("click", function () {
            menus.forEach(m => m && m.classList.remove("active"));
            this.classList.add("active"); /*adiciona a linha debaixo do que clicar*/
        });
    });
    if (menuFinanceiro) menuFinanceiro.classList.add("active"); /*deixa financeiro já sempre marcado*/

    /*FILTROS*/
    const filtroPeriodo = document.getElementById('filtroPeriodo');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    const hojeISO = new Date().toLocaleDateString('en-CA'); /*trava datas maiores que hoje no calendário*/
    dataFimInput.setAttribute('max', hojeISO);
    dataInicioInput.setAttribute('max', hojeISO);
    const filtroBarbeiro = document.getElementById('filtroBarbeiro');
    const filtroServico = document.getElementById('filtroServico');
    const btnAplicar = document.getElementById('btnAplicarFiltros');

    function limparSelectMantendoTodos(select) { /*mantém só a primeira opção (índice 0 = "Todos") no select de barbeiro e de serviço*/
        select.options.length = 1;
    }
    /*POPULANDO os select de BARBEIRO e SERVIÇO usando backend*/
    async function carregarBarbeirosEServicos() {
        try {
            /*barbeiros*/
            const barbeiros = await apiListarBarbeiros(); /*chama a função apiListarBarbeiros() que faz um fetch na minha api*/
            limparSelectMantendoTodos(filtroBarbeiro);

            (barbeiros || []).forEach(b => { /*percorre cada barbeiro da lista; b é um objeto do tipo {id, nome}*/
                const opt = document.createElement('option'); /*cria um <option> novo para esse barbeiro*/
                opt.value = b.id; /*o value da option será o id do barbeiro*/
                opt.textContent = b.nome; /*o texto exibido no select é o nome do barbeiro*/
                filtroBarbeiro.appendChild(opt); /*adiciona essa <option> dentro do <select> de barbeiro*/
            }); /*repete isso para cada barbeiro retornado pela API*/

            /*serviços*/
            const servicos = await apiListarServicos(); /*MESMA lógica*/
            limparSelectMantendoTodos(filtroServico);

            (servicos || []).forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.nome;
                filtroServico.appendChild(opt);
            });

        } catch (e) { /*se der erro, deixa só "Todos" como option*/
            console.error('Erro ao carregar barbeiros/serviços:', e);
        }
    }
    /*chama assim que a tela carregar:*/
    carregarBarbeirosEServicos();

    const API_BASE_URL = 'http://localhost:3000/api/financeiro'; /*base da API*/

    /*pega os CARDS pelo valor que está dentro deles:*/
    const cardTotalDia = document.getElementById('totalDia').closest('.col-12');
    const cardTotal7Dias = document.getElementById('totalSeteDias').closest('.col-12');
    const cardTotal30Dias = document.getElementById('totalMes').closest('.col-12');
    const cardTotalPeriodo = document.getElementById('totalPeriodo').closest('.col-12');
    const cardTotalBarbeiro = document.getElementById('totalPorBarbeiro').closest('.col-12');
    const cardTotalServico = document.getElementById('totalPorServico').closest('.col-12');
    const todosCardsResumo = document.querySelectorAll('.card-resumo'); /*lista com todos os cards de resumo da página*/

    /*deixa todos os CARDS INVISÍVEIS inicialmente:*/
    esconderTodosCardsResumo();
    function esconderTodosCardsResumo() {
        todosCardsResumo.forEach(card => card.closest('.col-12').classList.add('d-none')); /*escondendo os cards "resumo"*/
        /*esconder/mostra a coluna inteira (col-12) onde o card está, assim os cards visíveis se reencaixam lado a lado sem ficar buraco nem pular linha*/
    }

    /*função para CALCULAR inicio e fim a partir do SELECT*/
    function calcularInicioFim(periodo, dataIni, dataFim) { /*periodo = hoje, 7 dias, 30 dias ou vazio; dataIni = data inicial digitada pelo usuário quando período é personalizado; dataFim = data final digitada pelo usuário*/
        const hoje = new Date(); /*cria um objeto Date com a data e hora atuais do sistema*/
        let inicio = '';
        let fim = '';

        if (periodo === 'hoje') { /*se o período escolhido for "hoje"*/
            const iso = hoje.toISOString().slice(0, 10); /*transforma a data atual em uma string no formato ISO*/
            inicio = iso;
            fim = iso;
        } else if (periodo === '7dias') { /*se o período escolhido for "7 dias"*/
            const dInicio = new Date(); /*cria um novo Date com a data atual*/
            dInicio.setDate(hoje.getDate() - 6); /*pega o dia do mês e volta 6*/
            inicio = dInicio.toISOString().slice(0, 10); /*início = 7 dias atrás*/
            fim = hoje.toISOString().slice(0, 10); /*fim = hoje*/
        } else if (periodo === '30dias') { /*MESMA lógica de 7 dias atrás*/
            const dInicio = new Date();
            dInicio.setDate(hoje.getDate() - 29); // 30 dias
            inicio = dInicio.toISOString().slice(0, 10);
            fim = hoje.toISOString().slice(0, 10);
        } else { /*se não é nenhuma das 3 opções acima, é um período personalizado*/
            inicio = dataIni;
            fim = dataFim;
        }

        return { inicio, fim }; /*retorna a data de início e fim calculada/digitada*/
    }

    /*função para PADRONIZAR os VALORES*/
    function formatarMoeda(valor) {
        if (valor == null) return 'R$ 0,00'; /*se não veio valor, retorna 0,00*/
        return Number(valor).toLocaleString('pt-BR', { /*converte o valor para número e formata o número no padrão brasileiro:*/
            style: 'currency', /*formato de moeda*/
            currency: 'BRL' /*real brasileiro*/
        });
    }

    /*PREENCHER a tabela "por dia" no frontend*/
    function preencherTabelaPorDia(dados) { /*recebendo os dados do backend*/
        const tbody = document.getElementById('tabelaPorDia'); /*procura no HTML o elemento com id="tabelaPorDia"*/
        tbody.innerHTML = ''; /*onde as linhas da tabela serão colocadas; limpa antes para não acumular linhas antigas*/

        if (!dados || dados.length === 0) { /*se "dados" for null, undefined, falso ou um array vazio*/
            tbody.innerHTML = '<tr><td colspan="3">Nenhum registro encontrado.</td></tr>'; /*mostra essa mensagem*/
            return;
        }

        dados.forEach(l => { /*percorre cada item do array dados; l é um objeto com as infos de um dia*/
            const tr = document.createElement('tr'); /*cria uma linha na tabela*/

            const tdData = document.createElement('td'); /*cria uma célula para "data"*/
            /*a data vem no formato 2025-11-24, aí converte pra 24/11/2025:*/
            const partes = String(l.data).split('-');
            tdData.textContent = `${partes[2]}/${partes[1]}/${partes[0]}`;

            const tdQtd = document.createElement('td'); /*cria uma célula para "quantidade de atendimentos"*/
            tdQtd.textContent = l.quantidade_atendimentos; /*insere o valor l.quantidade_atendimentos (que veio do backend)*/

            const tdTotal = document.createElement('td'); /*cria uma célula para "total faturado"*/
            tdTotal.textContent = formatarMoeda(l.total_faturado); /*usa a função formatarMoeda pra transformar o número*/

            /*adiciona as três células dentro da linha, nessa ordem:*/
            tr.appendChild(tdData);
            tr.appendChild(tdQtd);
            tr.appendChild(tdTotal);

            tbody.appendChild(tr); /*coloca a linha pronta dentro da tabela*/
        });
    }

    /*PREENCHER a tabela "por barbeiro" no frontend*/
    function preencherTabelaPorBarbeiro(dados) { /*quase a MESMA lógica da criação da tabela por dia*/
        const tbody = document.getElementById('tabelaPorBarbeiro');
        tbody.innerHTML = '';

        if (!dados || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhum registro encontrado.</td></tr>';
            return;
        }

        dados.forEach(l => {
            const tr = document.createElement('tr');

            const tdNome = document.createElement('td');
            tdNome.textContent = l.barbeiro;

            const tdQtd = document.createElement('td');
            tdQtd.textContent = l.quantidade_atendimentos;

            const tdTotal = document.createElement('td');
            tdTotal.textContent = formatarMoeda(l.total_faturado);

            tr.appendChild(tdNome);
            tr.appendChild(tdQtd);
            tr.appendChild(tdTotal);

            tbody.appendChild(tr);
        });
    }

    /*PREENCHER a tabela "por serviço" no frontend*/
    function preencherTabelaPorServico(dados) { /*quase a MESMA lógica da criação da tabela por dia*/
        const tbody = document.getElementById('tabelaPorServico');
        tbody.innerHTML = '';

        if (!dados || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhum registro encontrado.</td></tr>';
            return;
        }

        dados.forEach(l => {
            const tr = document.createElement('tr');

            const tdNome = document.createElement('td');
            tdNome.textContent = l.servico;

            const tdQtd = document.createElement('td');
            tdQtd.textContent = l.quantidade_servicos;

            const tdTotal = document.createElement('td');
            tdTotal.textContent = formatarMoeda(l.total_faturado);

            tr.appendChild(tdNome);
            tr.appendChild(tdQtd);
            tr.appendChild(tdTotal);

            tbody.appendChild(tr);
        });
    }

    /*CARDS de RESUMO*/
    function atualizarCardsResumo(periodo, dadosPorDia, dadosPorBarbeiro, dadosPorServico, barbeiroSelecionado, servicoSelecionado) {
        /*função de soma - recebe uma lista e o nome do campo a ser somado*/
        const soma = (lista, campo) => (lista || []).reduce((acc, item) => acc + Number(item[campo] || 0), 0); /*percorre a lista inteira e soma, em um único número, o valor do campo informado de cada item do array, convertendo para número e considerando 0 quando o campo vier vazio; depois retorna*/

        if (periodo === 'hoje') { /*se o período for "hoje"*/
            const totalHoje = soma(dadosPorDia, 'total_faturado'); /*chama a função Soma passando total_faturado de todos os itens retornados em dadosPorDia*/
            document.getElementById('totalDia').textContent = formatarMoeda(totalHoje); /*procura o elemento com id = totalDia no HTML e coloca o texto formatado (ex: R$ 123,45)*/
        }

        if (periodo === '7dias') { /*se o período for "últimos 7 dias" - MESMA lógica*/
            const total7 = soma(dadosPorDia, 'total_faturado');
            document.getElementById('totalSeteDias').textContent = formatarMoeda(total7);
        }

        if (periodo === '30dias') { /*se o período for "últimos 30 dias" - MESMA lógica*/
            const total30 = soma(dadosPorDia, 'total_faturado');
            document.getElementById('totalMes').textContent = formatarMoeda(total30);
        }

        if (!periodo) { /*se o período por personalizado - MESMA lógica*/
            const totalPeriodo = soma(dadosPorDia, 'total_faturado');
            document.getElementById('totalPeriodo').textContent = formatarMoeda(totalPeriodo);
        }

        if (barbeiroSelecionado) { /*se for por barbeiro - MESMA lógica*/
            const totalBarb = soma(dadosPorBarbeiro, 'total_faturado');
            document.getElementById('totalPorBarbeiro').textContent = formatarMoeda(totalBarb);
        }

        if (servicoSelecionado) { /*se for por serviço - MESMA lógica*/
            const totalServ = soma(dadosPorServico, 'total_faturado');
            document.getElementById('totalPorServico').textContent = formatarMoeda(totalServ);
        }
    }

    /*função que CHAMA o BACKEND*/
    async function carregarDadosFinanceiro({ inicio, fim, barbeiroId, servicoId }) {
        const params = new URLSearchParams(); /*objeto URLSearchParams que serve pra montar a query string da URL*/

        /*para cada filtro, se tiver valor (não for vazio/nulo), adiciona filtro na query:*/
        if (inicio) params.append('inicio', inicio);
        if (fim) params.append('fim', fim);
        if (barbeiroId) params.append('barbeiroId', barbeiroId);
        if (servicoId) params.append('servicoId', servicoId);

        const query = params.toString(); /*converte o URLSearchParams para string*/

        const [porDia, porBarbeiro, porServico] = await Promise.all([ /*faz as três requisições ao mesmo tempo, em paralelo, todas usando a mesma query string (inicio, fim, barbeiroId, servicoId):*/
            fetch(`${API_BASE_URL}/por-dia?${query}`).then(r => r.json()), /*faz a requisição HTTP GET, quando a resposta chegar, converte o body pra JSON*/
            fetch(`${API_BASE_URL}/por-barbeiro?${query}`).then(r => r.json()),
            fetch(`${API_BASE_URL}/por-servico?${query}`).then(r => r.json())
        ]);
        /*usa os três arrays de dados para atualizar as tabelas na tela:*/
        preencherTabelaPorDia(porDia); /*monta a tabela “por dia”*/
        preencherTabelaPorBarbeiro(porBarbeiro); /*monta a tabela “por barbeiro*/
        preencherTabelaPorServico(porServico); /*monta a tabela “por serviço*/

        return { porDia, porBarbeiro, porServico }; /*devolve um objeto com os três conjuntos de dados*/
    }

    btnAplicar.addEventListener('click', async function () { /*ocorre quando clica no botão de fitrar*/
        const periodo = filtroPeriodo.value; /*hoje, 7 dias ou 30 dias*/
        const dataIni = dataInicioInput.value; /*data de início ou vazio*/
        const dataFim = dataFimInput.value; /*data de fim ou vazio*/
        const barbeiroTexto = filtroBarbeiro.options[filtroBarbeiro.selectedIndex].text.toLowerCase(); /*para saber qual opção foi escolhida no select*/
        const servicoTexto = filtroServico.options[filtroServico.selectedIndex].text.toLowerCase(); /*para saber qual opção foi escolhida no select*/
        const barbeiroId = filtroBarbeiro.value || ''; /*valor (ID) da opção pra mandar pro backend filtrar no banco*/
        const servicoId = filtroServico.value || ''; /*valor (ID) da opção pra mandar pro backend filtrar no banco*/
        const erros = []; /*lista de mensagens de erro*/

        /*obrigatório informar perído OU data inicial E final:*/
        const temPeriodo = periodo && periodo !== '';
        const temDatas = dataIni && dataFim;

        if (!temPeriodo && !temDatas) {
            erros.push('Informe um PERÍODO ou DATA INICIAL e DATA FINAL.');
        }

        if (temPeriodo && (dataIni || dataFim)) {
            erros.push('Escolha APENAS um PERÍODO ou APENAS DATAS, não os dois.');
        }

        if (erros.length > 0) { /*se tiver algum erro no meu array "erros"*/
            alert(erros.join('\n'));
            return; /*não continua o código*/
        }

        esconderTodosCardsResumo(); /*se passou nas validações acima, primeiro esconde tudo:*/

        /*lógica para mostrar os cards certos*/
        /*período selecionado:*/
        if (periodo === 'hoje') {
            cardTotalDia.classList.remove('d-none');
        }
        if (periodo === '7dias') {
            cardTotal7Dias.classList.remove('d-none');
        }
        if (periodo === '30dias') {
            cardTotal30Dias.classList.remove('d-none');
        }

        if (!temPeriodo && temDatas) {
            cardTotalPeriodo.classList.remove('d-none');
        }

        /*se o barbeiro for diferente de "todos", mostra o card de total por barbeiro:*/
        const textoBarbeiro = filtroBarbeiro.options[filtroBarbeiro.selectedIndex].text.toLowerCase();
        if (textoBarbeiro !== 'todos') {
            cardTotalBarbeiro.classList.remove('d-none');
        }

        /*se o serviço for diferente de "todos", mostra o card de total por serviço:*/
        const textoServico = filtroServico.options[filtroServico.selectedIndex].text.toLowerCase();
        if (textoServico !== 'todos') {
            cardTotalServico.classList.remove('d-none');
        }

        /*fluxo completo do filtro: calcula datas, busca dados na API, atualiza cards:*/
        const { inicio, fim } = calcularInicioFim(periodo, dataIni, dataFim); /*chama a função calcularInicioFim passaando valor do select e datas digitadas pelo usuário*/
        try {
            const { porDia, porBarbeiro, porServico } = await carregarDadosFinanceiro({ /*chama a função carregarDadosFinanceiro, passa os filtros e desestrutura a resposta em porDia, porBarbeiro, porServico */
                inicio,
                fim,
                barbeiroId: barbeiroTexto !== 'todos' ? barbeiroId : '',
                servicoId: servicoTexto !== 'todos' ? servicoId : ''
            });

            atualizarCardsResumo( /*chama a função atualizarCardsResumo pra atualizar os cards de resumo com base nos dados que busquei acima*/
                periodo, /*para saber qual card de período deve ser usado*/
                porDia, /*lista de dados por dia*/
                porBarbeiro, /*lista de dados por barbeiro*/
                porServico, /*lista de dados por serviço*/
                barbeiroTexto !== 'todos', /*usuário escolheu um barbeiro específico?*/
                servicoTexto !== 'todos' /*usuário escolheu um serviço específico?*/
            );
        } catch (e) { /*se acontecer qualquer erro dentro do try:*/
            console.error('Erro ao carregar dados financeiros:', e);
            alert('Erro ao carregar dados financeiros. Verifique se a API está rodando.');
        }
    });
});