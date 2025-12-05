const API = "http://localhost:3002";
let listaServicos = [];        // serviços do barbeiro selecionado
let listaBarbeiros = [];       // cache dos barbeiros carregados
let formaPagamento = null;

/* =============================
    CARREGAR CLIENTES
============================== */
async function carregarClientes() {
    try {
        const res = await fetch(`${API}/clientes`);
        const data = await res.json();
        const select = document.getElementById("cliente");
        select.innerHTML = `<option value="">Selecione</option>`;
        data.forEach(p => {
            select.innerHTML += `<option value="${p.id_pessoa}">${p.Nome}</option>`;
        });
    } catch (err) {
        console.error("Erro ao carregar clientes:", err);
    }
}
carregarClientes();

/* =============================
    CARREGAR BARBEIROS (VIEW)
============================== */
async function carregarBarbeiros() {
    try {
        const res = await fetch(`${API}/barbeiros`);
        const data = await res.json();
        listaBarbeiros = data;

        const select = document.getElementById("barbeiro");
        select.innerHTML = `<option value="">Selecione</option>`;

        data.forEach(b => {
            select.innerHTML += `<option value="${b.id_barbeiro}">${b.nome}</option>`;
        });
    } catch (err) {
        console.error("Erro ao carregar barbeiros:", err);
    }
}
carregarBarbeiros();

/* Quando escolher barbeiro, popula serviços daquele barbeiro */
document.getElementById("barbeiro").addEventListener("change", async () => {
    const id = document.getElementById("barbeiro").value;
    const select = document.getElementById("servico");
    select.innerHTML = "";

    if (!id) {
        listaServicos = [];
        atualizarValorDisplay(0);
        return;
    }

    const barbeiro = listaBarbeiros.find(b => String(b.id_barbeiro) === String(id));
    if (!barbeiro) {
        listaServicos = [];
        atualizarValorDisplay(0);
        return;
    }

    // a view já devolve os serviços como array (objetos com id, nome, preco)
    listaServicos = barbeiro.servicos || [];

    // popular select de serviços
    if (listaServicos.length === 0) {
        select.innerHTML = `<option value="">(sem serviços)</option>`;
        atualizarValorDisplay(0);
        return;
    }

    listaServicos.forEach(s => {
        // campos: s.id, s.nome, s.preco
        select.innerHTML += `<option value="${s.id}">${s.nome} - R$ ${Number(s.preco).toFixed(2).replace(".", ",")}</option>`;
    });

    atualizarTotal(); // recalcula caso algo já esteja selecionado
});

/* =============================
    CALCULAR TOTAL
============================== */
document.getElementById("servico").addEventListener("change", atualizarTotal);

function atualizarTotal() {
    const selecionados = Array.from(
        document.getElementById("servico").selectedOptions
    ).map(opt => Number(opt.value));

    const total = listaServicos
        .filter(s => selecionados.includes(Number(s.id)))
        .reduce((acc, s) => acc + Number(s.preco), 0);

    atualizarValorDisplay(total);
}

function atualizarValorDisplay(total) {
    document.getElementById("valor").textContent =
        "R$ " + total.toFixed(2).replace(".", ",");
}

/* =============================
    FORMA DE PAGAMENTO
============================== */
function selecionarPagamento(tipo) {
    formaPagamento = tipo;

    document.querySelectorAll(".btn-pagamento").forEach(btn => {
        btn.classList.remove("bg-primary", "ring-2", "ring-primary");
        btn.classList.add("bg-[#392829]");
    });

    const btn = document.getElementById("pg-" + tipo);
    if (btn) {
        btn.classList.remove("bg-[#392829]");
        btn.classList.add("bg-primary", "ring-2", "ring-primary");
    }
}

/* =============================
    INICIAR ATENDIMENTO
============================== */
async function iniciarAtendimento() {
    const id_pessoa = document.getElementById("cliente").value;
    const id_barbeiro = document.getElementById("barbeiro").value;

    // Extrai os serviços selecionados com seus dados completos
    const servicosSelecionados = Array.from(
        document.getElementById("servico").selectedOptions
    ).map(opt => {
        const id = Number(opt.value);
        const textoCompleto = opt.textContent;

        // Extrai nome e preço do texto (formato: "Nome - R$ 00,00")
        const partes = textoCompleto.split(" - R$ ");
        const nome = partes[0];
        const preco = partes.length > 1 ? Number(partes[1].replace(",", ".")) : 0;

        return {
            id: id,
            nome: nome,
            preco: preco
        };
    });

    const idsServicos = servicosSelecionados.map(s => s.id);
    const nomesServicos = servicosSelecionados.map(s => s.nome);

    // pega valor do display (formatado)
    const valorTexto = document.getElementById("valor").textContent
        .replace("R$ ", "")
        .replace(".", "")
        .replace(",", ".");

    const valor_total = Number(valorTexto) || 0;

    if (!id_pessoa || !id_barbeiro || idsServicos.length === 0) {
        alert("Preencha todos os campos!");
        return;
    }

    if (!formaPagamento) {
        alert("Selecione a forma de pagamento!");
        return;
    }

    // BODY FINAL
    const body = {
        id_pessoa,
        id_barbeiro,
        servicos: servicosSelecionados,  // Array completo com id, nome, preco
        valor_total,
        forma_pagamento: formaPagamento,
        nome_servicos: nomesServicos.join(", ")  // String com nomes separados por vírgula
    };

    try {
        const res = await fetch(`${API}/atendimentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Atendimento criado! ID: " + data.id_atendimento);
            // Resetar formulário
            document.getElementById("cliente").value = "";
            document.getElementById("barbeiro").value = "";
            document.getElementById("servico").innerHTML = "";
            listaServicos = [];
            atualizarValorDisplay(0);
            formaPagamento = null;
            document.querySelectorAll(".btn-pagamento").forEach(btn => {
                btn.classList.remove("bg-primary", "ring-2", "ring-primary");
                btn.classList.add("bg-[#392829]");
            });
        } else {
            alert("Erro: " + (data.erro || JSON.stringify(data)));
        }
    } catch (err) {
        console.error("Erro ao criar atendimento:", err);
        alert("Erro ao criar atendimento. Veja o console.");
    }
}