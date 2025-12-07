// ================================================================
// SISTEMA DE AGENDA PARA BARBEARIA
// Inclui: calendário mensal navegável, agendamento, edição e exclusão
// ================================================================

const url = 'http://localhost:3000';

// ---------- VARIÁVEIS GLOBAIS ----------
let dataSelecionada = null; // guarda a data atual selecionada
let mesAtual;               // mês sendo exibido (0 = janeiro)
let anoAtual;               // ano sendo exibido
let barbeiroSelecionado = '';


// ---------- INICIALIZAÇÃO ----------
document.addEventListener("DOMContentLoaded", async () => {
  const hoje = new Date();
  mesAtual = hoje.getMonth();
  anoAtual = hoje.getFullYear();
  dataSelecionada = hoje.toISOString().split("T")[0];

  await carregarBarbeiros();
  await carregarCalendario(anoAtual, mesAtual);

  document.getElementById("btnSalvar").addEventListener("click", salvarAgendamento);
  document.getElementById("btnFechar").addEventListener("click", fecharModal);
  document.getElementById("btnExcluir").addEventListener("click", excluirAgendamento);
});


// =======================================================
// GERAÇÃO DO CALENDÁRIO COM NAVEGAÇÃO ENTRE MESES
// =======================================================
async function carregarCalendario(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const mesNome = primeiroDia.toLocaleString("pt-BR", { month: "long" });

  // Atualiza o cabeçalho do calendário com botões de navegação
  document.getElementById("mes-ano").innerHTML = `
    <button id="prev-month" class="mes-btn">◀</button>
    <span>${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} ${ano}</span>
    <button id="next-month" class="mes-btn">▶</button>
  `;

  // Contêiner dos dias
  const grade = document.getElementById("grade-dias");
  grade.innerHTML = "";

  // Cria botões de cada dia do mês
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const btn = document.createElement("button");
    btn.classList.add("dia-btn");
    btn.textContent = dia;

    // Ao clicar, atualiza a data selecionada e carrega a agenda
    btn.addEventListener("click", async () => {
      dataSelecionada = dataISO;
      document.querySelectorAll(".dia-btn").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      await carregarAgenda(dataSelecionada);
    });

    grade.appendChild(btn);
  }

  // Eventos dos botões de navegação (precisam ser recriados após cada renderização)
  document.getElementById("prev-month").addEventListener("click", async () => {
    mesAtual--;
    if (mesAtual < 0) {
      mesAtual = 11;
      anoAtual--;
    }
    await carregarCalendario(anoAtual, mesAtual);
  });

  document.getElementById("next-month").addEventListener("click", async () => {
    mesAtual++;
    if (mesAtual > 11) {
      mesAtual = 0;
      anoAtual++;
    }
    await carregarCalendario(anoAtual, mesAtual);
  });
}

// =======================================================
// CARREGAMENTO DA AGENDA DO DIA SELECIONADO
// =======================================================
// Função responsável por carregar e exibir a agenda de um barbeiro em uma data específica
async function carregarAgenda(data, barbeiro = barbeiroSelecionado) {
  const container = document.getElementById("agenda-container");

  // Caso nenhum barbeiro tenha sido selecionado, exibe uma mensagem e interrompe a função
  if (!barbeiro) {
    container.innerHTML = `<h2 style="text-align:center; color:#f1c27d;">Selecione um barbeiro</h2>`;
    return;
  }

  // Busca todos os agendamentos armazenados
  const response = await fetch(url + "/agendar")
  const agendamentos = '';
  if (!response.ok)
    {

    }else
    {
      agendamentos = response.json().data 
    };

  // Lista fixa de horários disponíveis para agendamento
  const horarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];

  // Quebra a string da data (yyyy-mm-dd) em partes separadas
  const [ano, mes, dia] = data.split("-");

  // Monta o cabeçalho da agenda com nome do barbeiro e data formatada
  container.innerHTML = `
    <h2 style="text-align:center; color:#f1c27d;">
      Agenda de ${barbeiro.Nome} — ${dia}/${mes}/${ano}
    </h2>
    <div class="lista-horarios"></div>
  `;

  // Seleciona o contêiner onde os horários serão exibidos
  const lista = container.querySelector(".lista-horarios");

  // Para cada horário disponível...
  const ag = '';
  horarios.forEach(hora => {

    if(agendamentos != '')
    {
      ag = agendamentos.find(a => 
        a.data === data &&
        a.horario === hora &&
        a.barbeiro === barbeiro.Nome
      )
    }
    // Procura se existe um agendamento correspondente na API
   ;

    // Cria o bloco visual do horário
    const slot = document.createElement("div");
    slot.classList.add("horario");
    slot.dataset.horario = hora;        // Armazena o horário no dataset
    slot.dataset.barbeiroId = barbeiro.id; // Armazena o ID do barbeiro

    // Se já existir um agendamento nesse horário...
    if (ag) {
      // Exibe o nome do cliente e o serviço agendado
      slot.innerHTML = `
        <div class="agendamento" data-id="${ag.id}">
          <strong>${ag.cliente}</strong><br>${ag.servico}
        </div>
      `;
      // Clique abre o modal de edição do agendamento
      slot.querySelector(".agendamento").addEventListener("click", abrirModalEditar);

    } else {
      // Se não tiver agendamento, o horário fica livre
      slot.textContent = hora;

      // Clique abre o modal para criar um novo agendamento
      slot.addEventListener("click", abrirModalNovo);
    }

    // Adiciona o horário (slot) na lista da agenda
    lista.appendChild(slot);
  });
}

// Função responsável por carregar a lista de barbeiros na interface
async function carregarBarbeiros() {
  const lista = document.getElementById("lista-barbeiros");
  const dropdown = document.getElementById("barbeiro-dropdown");
  // Busca todos os barbeiros na API
  let barbeiros = await fetch(url +"/barbeiros").then(r => r.json());
  barbeiros = barbeiros.data;
  console.log(barbeiros);

  // Limpa conteúdos anteriores da lista e do dropdown
  lista.innerHTML = "";
  dropdown.innerHTML = "";

  //Se houver mais de 4 barbeiros, exibe o dropdown em vez dos cards
  if (barbeiros.length > 4) {
    lista.style.display = "none";  
    dropdown.style.display = "block"; 

    // Monta as opções do dropdown
    dropdown.innerHTML = `
      <option value="">Selecione...</option>
      ${barbeiros.map(b => `<option value="${b.ID_pessoa}">${b.Nome}</option>`).join("")}
    `;

    // Evento que dispara quando o usuário escolhe um barbeiro no dropdown
    dropdown.addEventListener("change", async () => {
      const id = dropdown.value;

      // Encontra no array o barbeiro selecionado
      barbeiroSelecionado = barbeiros.find(b => b.ID_pessoa == id);

      // Se houver uma data escolhida, recarrega a agenda desse barbeiro
      if (dataSelecionada && barbeiroSelecionado) {
        await carregarAgenda(dataSelecionada, barbeiroSelecionado);
      }
    });

    // Para evitar que execute o bloco dos cards
    return;
  }

  // Caso tenha até 4 barbeiros, usa cards visualmente mais agradáveis
  lista.style.display = "flex";   
  dropdown.style.display = "none"; 

  // Para cada barbeiro, cria um card
  barbeiros.forEach(b => {
    const card = document.createElement("div");
    card.classList.add("card-barbeiro");
    card.dataset.id = b.id;

    // Conteúdo do card
    card.innerHTML = `
      <h3>${b.nome}</h3>
    `;
    // Evento ao clicar em um card
    card.addEventListener("click", async () => {
      barbeiroSelecionado = b; // Define qual barbeiro foi escolhido
      // Remove destaque dos outros cards
      document.querySelectorAll(".card-barbeiro").forEach(c => c.classList.remove("ativo"));
      // Marca o card atual como ativo
      card.classList.add("ativo");
      // Se existir data selecionada, carrega a agenda desse barbeiro
      if (dataSelecionada) {
        await carregarAgenda(dataSelecionada, barbeiroSelecionado);
      }
    });

    // Adiciona o card na lista
    lista.appendChild(card);
  });
}


// =======================================================
// MODAL: NOVO AGENDAMENTO
// =======================================================

async function abrirModalNovo(e) {
  // Busca a lista de serviços disponíveis na API
  let servicos = await fetch(url +"/servicos").then(r => r.json());
  servicos = servicos.data;
  // Exibe o modal na tela
  document.getElementById("modal").style.display = "flex";
  // Define o título do modal como "Novo Agendamento"
  document.getElementById("modal-titulo").textContent = "Novo Agendamento";
  // Oculta o botão de exclusão, pois um novo agendamento não pode ser apagado
  document.getElementById("btnExcluir").classList.add("hidden");
  // Limpa o campo de nome do cliente
  document.getElementById("cliente").value = "";
  // Preenche o campo de horário com o horário clicado na agenda
  document.getElementById("horario").value = e.target.dataset.horario;
  // Seleciona o elemento <select> de serviços
  const servicoSelect = document.getElementById("servico");
  // Preenche o <select> com a lista de serviços retornados pela API
  servicoSelect.innerHTML = servicos.map(s =>
    `<option value="${s.ID_servico}">${s.Titulo}</option>`
  ).join("");
  // Limpa o campo de ID, pois ainda não existe um agendamento salvo
  document.getElementById("agendamento-id").value = "";
}

// =======================================================
// MODAL: EDITAR AGENDAMENTO EXISTENTE
// =======================================================

async function abrirModalEditar(e) {
  // Impede que o clique no agendamento acione o evento do slot de horário
  e.stopPropagation();
  // Obtém o ID do agendamento a partir do elemento clicado
  const id = e.currentTarget.dataset.id;
  // Busca os dados completos do agendamento na API
  const ag = await fetch(url + `/agendar/${id}`).then(r => r.json());
  // Busca a lista completa de barbeiros (para o select)
  const barbeiros = await fetch(url + "/barbeiros").then(r => r.json());
  // Busca a lista de serviços (para o select)
  const servicos = await fetch(url + "/servicos").then(r => r.json());
  // Exibe o modal
  document.getElementById("modal").style.display = "flex";
  // Ajusta o título para modo de edição
  document.getElementById("modal-titulo").textContent = "Editar Agendamento";
  // Exibe o botão de excluir (permitido somente ao editar)
  document.getElementById("btnExcluir").classList.remove("hidden");

  // Preenche campos básicos do agendamento
  document.getElementById("agendamento-id").value = ag.ID_agenda;
  document.getElementById("cliente").value = ag.ID_pessoa;
  document.getElementById("horario").value = ag.horario;

  // --- Preenche lista de barbeiros no select ---
  const barbeiroSelect = document.getElementById("barbeiro");

  // Cada opção é marcada como 'selected' se for o barbeiro desse agendamento
  barbeiroSelect.innerHTML = barbeiros.map(b =>
    `<option value="${b.ID_pessoa}" ${b.Nome === ag.barbeiro ? "selected" : ""}>${b.Nome}</option>`
  ).join("");
  // --- Preenche lista de serviços no select ---
  const servicoSelect = document.getElementById("servico");
  // Cada opção é marcada como 'selected' se for o serviço desse agendamento
  servicoSelect.innerHTML = servicos.map(s =>
    `<option value="${s.ID_servico}" ${s.Titulo === ag.servico ? "selected" : ""}>${s.nome}</option>`
  ).join("");
}


// =======================================================
// SALVAR (NOVO OU EDIÇÃO) DE AGENDAMENTO
// =======================================================
async function salvarAgendamento() {

  // Obtém o ID do agendamento (se existir). 
  // Se estiver vazio, significa que é um novo.
  const id = document.getElementById("agendamento-id").value;

  // Monta o objeto com os dados que serão enviados 
  const data = {
    barbeiro_id: barbeiroSelecionado.ID_pessoa,                       // ID do barbeiro selecionado
    cliente: document.getElementById("cliente").value,         // Nome do cliente
    servico_id: document.getElementById("servico").value,      // Serviço escolhido
    horario: document.getElementById("horario").value,         // Horário selecionado
    data: dataSelecionada                                      // Data da agenda
  };
  console.log (data);

  // Define o método HTTP:
  // PUT → edição de agendamento existente
  // POST → criação de novo agendamento
  const metodo = id ? "PATCH" : "POST";

  // Define a URL adequada para inserir ou atualizar o agendamento
  const endpoint = id ? `${url}/agendar/${id}` : `${url}/agendar`;

  // Envia os dados 
  await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)      // Converte o objeto para JSON
  });

  // Fecha o modal após salvar
  fecharModal();

  // Recarrega a agenda atualizada na tela
  await carregarAgenda(dataSelecionada, barbeiroSelecionado);
}


// =======================================================
// EXCLUSÃO DE AGENDAMENTO
// =======================================================
async function excluirAgendamento() {
  const id = document.getElementById("agendamento-id").value;
  await fetch(url + `/agendar/${id}`, { method: "DELETE" });
  fecharModal();
  await carregarAgenda(dataSelecionada);
}

// =======================================================
// FECHAR MODAL
// =======================================================
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}
