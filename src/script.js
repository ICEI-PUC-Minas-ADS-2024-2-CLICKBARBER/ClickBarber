const agendaData = [
  {
    nome: "Gabriel Fonseca Diniz",
    foto: "img/barbeiro.jpg",
    dias: {
      "2025-10-18": [
        { hora: "08:00", cliente: "João Silva", servico: "Corte de cabelo" },
        { hora: "09:50", cliente: "Marcos Pereira", servico: "Barba completa" }
      ]
    }
  },
  {
    nome: "Junior Lucas Gusman",
    foto: "img/barbeiro2.jpg",
    dias: {
      "2025-10-18": [
        { hora: "07:30", cliente: "Carlos Lima", servico: "Corte social" }
      ]
    }
  },
  {
    nome: "Daniel Lopes Salomé",
    foto: "img/barbeiro3.jpg",
    dias: {
      "2025-10-18": [
        { hora: "08:45", cliente: "Rafael Melo", servico: "Corte degradê" },
        { hora: "10:15", cliente: "Pedro Oliveira", servico: "Barba e sobrancelha" }
      ]
    }
  }
];

const agendaContainer = document.getElementById("agenda");
const filtroBarbeiro = document.getElementById("filtroBarbeiro");
const filtroData = document.getElementById("filtroData");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimpar = document.getElementById("btnLimpar");

const modal = document.getElementById("modalStatus");
const modalCliente = document.getElementById("modalCliente");
const btnChegou = document.getElementById("btnChegou");
const btnFaltou = document.getElementById("btnFaltou");
const btnCancelar = document.getElementById("btnCancelar");

let modalDados = {}; // guarda informações do cliente clicado

// Preenche os selects de barbeiro
function preencherSelects() {
  filtroBarbeiro.innerHTML = '<option value="">Todos os barbeiros</option>';
  document.getElementById("barbeiroSelect").innerHTML = '<option value="">Selecione o barbeiro</option>';

  agendaData.forEach(b => {
    const option = document.createElement("option");
    option.value = b.nome;
    option.textContent = b.nome;
    filtroBarbeiro.appendChild(option);

    const opt2 = option.cloneNode(true);
    document.getElementById("barbeiroSelect").appendChild(opt2);
  });
}

// Renderiza a agenda
function renderAgenda(filtroNome = "", filtroDia = "") {
  agendaContainer.innerHTML = "";

  agendaData.forEach(barbeiro => {
    if (filtroNome && barbeiro.nome !== filtroNome) return;

    const section = document.createElement("div");
    section.classList.add("barbeiro");

    section.innerHTML = `
      <img src="${barbeiro.foto}" alt="${barbeiro.nome}">
      <div class="info">
        <h2>${barbeiro.nome}</h2>
        ${Object.entries(barbeiro.dias)
          .filter(([data]) => !filtroDia || data === filtroDia)
          .map(([data, horarios]) => {
              // Ordena os horários do dia
              horarios.sort((a, b) => {
                const horaA = new Date(`1970-01-01T${a.hora}:00`).getTime();
                const horaB = new Date(`1970-01-01T${b.hora}:00`).getTime();
                return horaA - horaB;
              });

              return `
                <div class="dia">
                  <strong>${new Date(data).toLocaleDateString("pt-BR")}</strong>
                  ${horarios.map((h, index) => `
                    <div class="horario ${h.status || ""}">
                      <div>${h.hora}</div>
                      <div class="cliente-nome" data-barbeiro="${barbeiro.nome}" data-data="${data}" data-index="${index}">
                        ${h.cliente}
                      </div>
                      <div>${h.servico}</div>
                      <button class="btn-remover" data-barbeiro="${barbeiro.nome}" data-data="${data}" data-index="${index}">🗑️</button>
                    </div>
                  `).join("")}
                </div>
              `;
          }).join("")}
      </div>
    `;

    agendaContainer.appendChild(section);
  });

  // Event listeners para abrir modal
  document.querySelectorAll(".cliente-nome").forEach(cliente => {
    cliente.addEventListener("click", e => {
      abrirModal(
        e.target.dataset.barbeiro,
        e.target.dataset.data,
        e.target.dataset.index
      );
    });
  });

  // Event listeners para remover agendamento
  document.querySelectorAll(".btn-remover").forEach(botao => {
    botao.addEventListener("click", e => {
      removerAgendamento(
        e.target.dataset.barbeiro,
        e.target.dataset.data,
        e.target.dataset.index
      );
    });
  });
}

// --- MODAL ---
function abrirModal(nomeBarbeiro, data, index) {
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro || !barbeiro.dias[data] || !barbeiro.dias[data][index]) return;

  modalDados = { nomeBarbeiro, data, index };
  modalCliente.textContent = `Cliente: ${barbeiro.dias[data][index].cliente}`;
  modal.style.display = "flex";
}

function fecharModal() { modal.style.display = "none"; }

function atualizarStatusModal(status) {
  const { nomeBarbeiro, data, index } = modalDados;
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro || !barbeiro.dias[data] || !barbeiro.dias[data][index]) return;

  barbeiro.dias[data][index].status = status;
  fecharModal();
  renderAgenda();
}

// Eventos do modal
btnChegou.addEventListener("click", () => atualizarStatusModal("chegou"));
btnFaltou.addEventListener("click", () => atualizarStatusModal("faltou"));
btnCancelar.addEventListener("click", fecharModal);
modal.addEventListener("click", e => { if (e.target === modal) fecharModal(); });

// --- FILTROS ---
btnFiltrar.addEventListener("click", () => renderAgenda(filtroBarbeiro.value, filtroData.value));
btnLimpar.addEventListener("click", () => {
  filtroBarbeiro.value = "";
  filtroData.value = "";
  renderAgenda();
});

// --- AGENDAMENTOS ---
function adicionarAgendamento(nomeBarbeiro, data, hora, cliente, servico) {
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro) return;

  if (!barbeiro.dias[data]) barbeiro.dias[data] = [];

  const novaHora = new Date(`1970-01-01T${hora}:00`).getTime();
  const conflito = barbeiro.dias[data].some(h => Math.abs(new Date(`1970-01-01T${h.hora}:00`).getTime() - novaHora) < 30*60*1000);

  if (conflito) {
    alert(`⚠️ Horário muito próximo de outro agendamento.`);
    return;
  }

  barbeiro.dias[data].push({ hora, cliente, servico });
  alert(`✅ Agendamento adicionado para ${cliente}`);
  renderAgenda();
}

function removerAgendamento(nomeBarbeiro, data, index) {
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro || !barbeiro.dias[data]) return;

  const cliente = barbeiro.dias[data][index].cliente;
  if (confirm(`Remover agendamento de ${cliente}?`)) {
    barbeiro.dias[data].splice(index, 1);
    if (barbeiro.dias[data].length === 0) delete barbeiro.dias[data];
    renderAgenda();
  }
}

// Botão Agendar
document.getElementById("btnAgendar").addEventListener("click", () => {
  const barbeiro = document.getElementById("barbeiroSelect").value;
  const data = document.getElementById("dataInput").value;
  const hora = document.getElementById("horaInput").value;
  const cliente = document.getElementById("clienteInput").value;
  const servico = document.getElementById("servicoInput").value;

  if (!barbeiro || !data || !hora || !cliente || !servico) {
    alert("Preencha todos os campos!");
    return;
  }

  adicionarAgendamento(barbeiro, data, hora, cliente, servico);
});

// Inicialização
preencherSelects();
renderAgenda();
