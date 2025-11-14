// ID da barbearia logada
const barbeariaId = localStorage.getItem("barbeariaId");

// Elementos da tela
const searchInput = document.getElementById("searchBarbeiro");
const listaBarbeiros = document.getElementById("listaBarbeiros");
const areaServicos = document.getElementById("areaServicos");
const dropdownServicos = document.getElementById("dropdownServicos");
const btnSalvar = document.getElementById("btnSalvar");

let barbeiros = [];
let servicosDaBarbearia = [];
let barbeiroSelecionado = null;



//Carrega dados iniciais
async function carregarDados() {
    const barbearia = await fetch(`http://localhost:3000/barbearias/${barbeariaId}`)
        .then(r => r.json());

    servicosDaBarbearia = barbearia.servicos;
    barbeiros = barbearia.barbeiros;

    mostrarBarbeiros(barbeiros);
}

carregarDados();


//Exibir lista de barbeiros na tela


function mostrarBarbeiros(lista) {
    listaBarbeiros.innerHTML = "";

    lista.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b.nome;

        li.addEventListener("click", () => selecionarBarbeiro(b));

        listaBarbeiros.appendChild(li);
    });
}



// Pesquisa de barbeiro por nome


searchInput.addEventListener("input", () => {
    const busca = searchInput.value.toLowerCase();

    const filtrados = barbeiros.filter(b =>
        b.nome.toLowerCase().includes(busca)
    );

    mostrarBarbeiros(filtrados);
});



// Ao clicar no barbeiro → mostra serviços
function selecionarBarbeiro(b) {
    barbeiroSelecionado = b;

    areaServicos.style.display = "block";

    dropdownServicos.innerHTML = "";

    // Preenche o dropdown com os serviços da barbearia
    servicosDaBarbearia.forEach(serv => {
        const opt = document.createElement("option");
        opt.value = serv;
        opt.textContent = serv;

        // marca se o barbeiro já faz esse serviço
        if (b.servicos.includes(serv)) {
            opt.selected = true;
        }

        dropdownServicos.appendChild(opt);
    });
}



// Salvar serviços selecionados


btnSalvar.addEventListener("click", async () => {
    if (!barbeiroSelecionado) return;

    // Pega serviços selecionados
    const selecionados = Array.from(dropdownServicos.selectedOptions)
        .map(opt => opt.value);

    // Atualiza o barbeiro dentro da barbearia
    const novaListaBarbeiros = barbeiros.map(b => {
        if (b.id === barbeiroSelecionado.id) {
            return { ...b, servicos: selecionados };
        }
        return b;
    });

    // PATCH para atualizar a barbearia inteira
    await fetch(`http://localhost:3000/barbearias/${barbeariaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barbeiros: novaListaBarbeiros })
    });

    alert("Serviços atualizados com sucesso!");

    // Atualiza dados locais
    barbeiros = novaListaBarbeiros;
});
