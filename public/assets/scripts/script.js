const agendaData = [
  {
    nome: "Gabriel Fonseca Diniz",
    foto: "../public/assets/img/barbeiro.jpg",
    dias: {
      "2025-10-18": [
        { hora: "08:00", cliente: "João Silva", servico: "Corte de cabelo" },
        { hora: "09:50", cliente: "Marcos Pereira", servico: "Barba completa" }
      ]
    }
  },
  {
    nome: "Junior Lucas Gusman",
    foto: "../public/assets/img/barbeiro2.jpg",
    dias: {
      "2025-10-18": [
        { hora: "07:30", cliente: "Carlos Lima", servico: "Corte social" }
      ]
    }
  },
  {
    nome: "Daniel Lopes Salomé",
    foto: "../public/assets/img/barbeiro3.jpg",
    dias: {
      "2025-10-18": [
        { hora: "08:45", cliente: "Rafael Melo", servico: "Corte degradê" },
        { hora: "10:15", cliente: "Pedro Oliveira", servico: "Barba e sobrancelha" }
      ]
    }
  }
];

// --- REFERÊNCIAS A ELEMENTOS DO DOM ---

// Container principal onde toda a agenda (barbeiros, datas e horários) será renderizada
const agendaContainer = document.getElementById("agenda");

// --- FILTROS ---
const filtroBarbeiro = document.getElementById("filtroBarbeiro"); // Select de filtro de barbeiros
const filtroData = document.getElementById("filtroData");         // Input de filtro por data
const btnFiltrar = document.getElementById("btnFiltrar");         // Botão para aplicar os filtros
const btnLimpar = document.getElementById("btnLimpar");           // Botão para limpar os filtros e mostrar tudo

// --- MODAL DE STATUS ---
// Elementos relacionados ao modal que exibe e atualiza o status dos agendamentos
const modal = document.getElementById("modalStatus");             // Container principal do modal
const modalCliente = document.getElementById("modalCliente");     // Exibe o nome do cliente no modal
const btnChegou = document.getElementById("btnChegou");           // Botão "Cliente chegou"
const btnFaltou = document.getElementById("btnFaltou");           // Botão "Cliente faltou"
const btnCancelar = document.getElementById("btnCancelar");       // Botão "Cancelar" (fecha o modal)


let modalDados = {}; // guarda informações do cliente clicado

// --- PREENCHER OS SELECTS DE BARBEIRO ---
// Esta função atualiza automaticamente as listas suspensas (select)
// de barbeiros usados nos filtros e no formulário de agendamento.
function preencherSelects() {
  // Define o conteúdo inicial do select de filtro (mostra "Todos os barbeiros")
  filtroBarbeiro.innerHTML = '<option value="">Todos os barbeiros</option>';
  // Define o conteúdo inicial do select de agendamento (mostra "Selecione o barbeiro")
  document.getElementById("barbeiroSelect").innerHTML = '<option value="">Selecione o barbeiro</option>';
  
  // Percorre todos os barbeiros cadastrados na agenda
  agendaData.forEach(b => {
    // Cria um elemento <option> para representar o barbeiro no select
    const option = document.createElement("option");
    option.value = b.nome;        // O valor interno da opção será o nome do barbeiro
    option.textContent = b.nome;  // O texto exibido também será o nome do barbeiro

    // Adiciona a opção ao select usado nos filtros da agenda
    filtroBarbeiro.appendChild(option);

    // Clona a mesma opção para o select do formulário de agendamento
    // (necessário porque um mesmo elemento não pode estar em dois lugares do DOM)
    const opt2 = option.cloneNode(true);
    document.getElementById("barbeiroSelect").appendChild(opt2);
  });
}

// Renderiza a agenda

// aplicando filtros opcionais por barbeiro (nome) e/ou data específica.
function renderAgenda(filtroNome = "", filtroDia = "") {
  agendaContainer.innerHTML = "";

  // Percorre a lista completa de barbeiros cadastrados na variável "agendaData"
  agendaData.forEach(barbeiro => {
    if (filtroNome && barbeiro.nome !== filtroNome) return;

    const section = document.createElement("div");
    section.classList.add("barbeiro");
    // Monta o conteúdo HTML da seção do barbeiro
    section.innerHTML = `
      <img src="${barbeiro.foto}" alt="${barbeiro.nome}">
      <div class="info">
        <h2>${barbeiro.nome}</h2>
        ${Object.entries(barbeiro.dias)
          .filter(([data]) => !filtroDia || data === filtroDia)
          .map(([data, horarios]) => {
              // Ordena os horários do dia
              // Converte o horário para número (em milissegundos) e ordena de forma crescente
              horarios.sort((a, b) => {
                const horaA = new Date(`1970-01-01T${a.hora}:00`).getTime();
                const horaB = new Date(`1970-01-01T${b.hora}:00`).getTime();
                return horaA - horaB;
              });

              // Retorna o bloco HTML que representa os horários de um dia específico
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
// Função responsável por abrir o modal com informações de um agendamento específico
function abrirModal(nomeBarbeiro, data, index) {
  // Localiza o barbeiro correspondente dentro do array "agendaData"
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  // Se o barbeiro, a data ou o índice do agendamento não existirem, a função é interrompida
  if (!barbeiro || !barbeiro.dias[data] || !barbeiro.dias[data][index]) return;
  // Guarda temporariamente os dados do agendamento aberto no modal (para uso posterior)
  modalDados = { nomeBarbeiro, data, index };
  // Exibe o nome do cliente no modal
  modalCliente.textContent = `Cliente: ${barbeiro.dias[data][index].cliente}`;
  // Torna o modal visível na tela
  modal.style.display = "flex";
}
// Função simples para fechar o modal (ocultar da tela)
function fecharModal() {
  modal.style.display = "none";
}
// Função que atualiza o status de um agendamento através do modal
function atualizarStatusModal(status) {
  // Recupera as informações armazenadas anteriormente quando o modal foi aberto
  const { nomeBarbeiro, data, index } = modalDados;
  // Encontra novamente o barbeiro correspondente na agenda
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  // Verifica se os dados do agendamento são válidos antes de prosseguir
  if (!barbeiro || !barbeiro.dias[data] || !barbeiro.dias[data][index]) return;
  // Atualiza o status do agendamento (por exemplo: "concluído", "cancelado", etc.)
  barbeiro.dias[data][index].status = status;

  // Fecha o modal após a atualização
  fecharModal();
  // Recarrega/renderiza novamente a agenda na tela para refletir a alteração
  renderAgenda();
}


// --- EVENTOS DO MODAL ---

// Quando o cliente chega, atualiza o status do agendamento para "chegou"
btnChegou.addEventListener("click", () => atualizarStatusModal("chegou"));
// Quando o cliente falta, atualiza o status do agendamento para "faltou"
btnFaltou.addEventListener("click", () => atualizarStatusModal("faltou"));
// Botão para cancelar/fechar o modal manualmente
btnCancelar.addEventListener("click", fecharModal);
// Fecha o modal se o usuário clicar fora da área do conteúdo (no fundo escuro)
modal.addEventListener("click", e => {
  if (e.target === modal) fecharModal();
});


// --- FILTROS ---

// Ao clicar em "Filtrar", renderiza novamente a agenda com base nos filtros selecionados
btnFiltrar.addEventListener("click", () => 
  renderAgenda(filtroBarbeiro.value, filtroData.value)
);
// Ao clicar em "Limpar", remove os filtros e exibe todos os agendamentos novamente
btnLimpar.addEventListener("click", () => {
  filtroBarbeiro.value = ""; // Limpa o filtro de barbeiro
  filtroData.value = "";     // Limpa o filtro de data
  renderAgenda();            // Recarrega a agenda completa
});


// --- AGENDAMENTOS ---

// Função responsável por adicionar um novo agendamento à agenda de um barbeiro
function adicionarAgendamento(nomeBarbeiro, data, hora, cliente, servico) {
  // Localiza o barbeiro correspondente pelo nome dentro do array principal "agendaData"
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro) return; // Se o barbeiro não for encontrado, encerra a função
  // Se o barbeiro ainda não tiver nenhum agendamento para a data informada, cria um novo array para ela
  if (!barbeiro.dias[data]) barbeiro.dias[data] = [];
  // Converte a hora do novo agendamento em milissegundos para facilitar cálculos de diferença entre horários
  const novaHora = new Date(`1970-01-01T${hora}:00`).getTime();
  // Verifica se já existe outro agendamento muito próximo (menos de 30 minutos de diferença)
  const conflito = barbeiro.dias[data].some(h => 
    Math.abs(new Date(`1970-01-01T${h.hora}:00`).getTime() - novaHora) < 30 * 60 * 1000
  );
  // Caso exista um conflito de horário, exibe um alerta e cancela o agendamento
  if (conflito) {
    alert(`⚠️ Horário muito próximo de outro agendamento.`);
    return;
  }
  // Adiciona o novo agendamento à lista do barbeiro para a data especificada
  barbeiro.dias[data].push({ hora, cliente, servico });
  // Informa o sucesso ao usuário
  alert(`✅ Agendamento adicionado para ${cliente}`);
  // Atualiza a interface da agenda para refletir a nova adição
  renderAgenda();
}

// Função responsável por remover um agendamento específico
function removerAgendamento(nomeBarbeiro, data, index) {
  // Localiza o barbeiro e verifica se há agendamentos para a data informada
  const barbeiro = agendaData.find(b => b.nome === nomeBarbeiro);
  if (!barbeiro || !barbeiro.dias[data]) return;
  // Obtém o nome do cliente para exibir na confirmação
  const cliente = barbeiro.dias[data][index].cliente;
  // Exibe uma caixa de confirmação antes de remover o agendamento
  if (confirm(`Remover agendamento de ${cliente}?`)) {
    // Remove o agendamento do array
    barbeiro.dias[data].splice(index, 1);
    // Se a data ficar sem agendamentos, remove a chave correspondente
    if (barbeiro.dias[data].length === 0) delete barbeiro.dias[data];
    // Atualiza a interface da agenda após a remoção
    renderAgenda();
  }
}


// --- BOTÃO "AGENDAR" ---
document.getElementById("btnAgendar").addEventListener("click", () => {
  
  // Captura os valores dos campos do formulário
  const barbeiro = document.getElementById("barbeiroSelect").value; // Nome do barbeiro selecionado
  const data = document.getElementById("dataInput").value;           // Data escolhida
  const hora = document.getElementById("horaInput").value;           // Horário selecionado
  const cliente = document.getElementById("clienteInput").value;     // Nome do cliente
  const servico = document.getElementById("servicoInput").value;     // Tipo de serviço (ex: corte, barba, etc.)

  // Verifica se todos os campos foram preenchidos antes de prosseguir
  if (!barbeiro || !data || !hora || !cliente || !servico) {
    alert("Preencha todos os campos!"); // Exibe alerta se algum campo estiver vazio
    return; // Interrompe a execução
  }
  // Se todos os campos estiverem preenchidos, chama a função que adiciona o agendamento
  adicionarAgendamento(barbeiro, data, hora, cliente, servico);
});

// Inicialização
preencherSelects();
renderAgenda();
