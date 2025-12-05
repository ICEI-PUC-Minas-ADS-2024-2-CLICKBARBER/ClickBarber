const listaServicos = document.getElementById('listaServicos');
const url = "http://localhost:3001/servicos";

const modal = document.getElementById('modal');
const modalConfirm = document.getElementById('modalConfirm');
const form = document.getElementById('formServico');
const modalTitle = document.getElementById('modalTitle');
const btnCancelar = document.getElementById('btnCancelar');
const mensagem = document.getElementById('mensagem');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelarRemover = document.getElementById('btnCancelarRemover');

let idParaRemover = null;

// ---------- Funções de UI ----------
function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.style.display = 'block';
  setTimeout(() => mensagem.style.display = 'none', 3000);
}

function abrirModal(titulo, servico = {}) {
  modalTitle.textContent = titulo;
  modal.style.display = 'flex';

  document.getElementById('servicoId').value = servico.ID_servico || '';
  document.getElementById('titulo').value = servico.Titulo || '';
  document.getElementById('descricao').value = servico.Descricao || '';
  document.getElementById('preco').value = servico.Preco || '';
  document.getElementById('duracao').value = servico.Duracao || '';
}

function fecharModal() {
  modal.style.display = 'none';
  form.reset();
}

function abrirConfirmacao(id) {
  idParaRemover = id;
  modalConfirm.style.display = 'flex';
}

function fecharConfirmacao() {
  modalConfirm.style.display = 'none';
  idParaRemover = null;
}

btnCancelar.addEventListener('click', fecharModal);
btnCancelarRemover.addEventListener('click', fecharConfirmacao);

// ---------- CRUD ----------
async function carregarServicos() {
  const res = await fetch(url);
  const servicos = await res.json();

  listaServicos.innerHTML = '';

  servicos.forEach(s => {
    const div = document.createElement('div');
    div.classList.add('card');

    div.innerHTML = `
      <h2>${s.Titulo}</h2>
      <p>${s.Descricao}</p>
      <p><strong>Preço:</strong> R$${parseFloat(s.Preco).toFixed(2)}</p>
      <p><strong>Duração:</strong> ${s.Duracao} min</p>
      <div class="acoes-card">
        <button class="btn-editar" data-id="${s.ID_servico}">Editar</button>
        <button class="btn-remover" data-id="${s.ID_servico}">Remover</button>
      </div>
    `;

    listaServicos.appendChild(div);
  });

  // Botões de editar
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${url}/${id}`);
      const servico = await res.json();
      abrirModal('Editar Serviço', servico);
    });
  });

  // Botões de remover
  document.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      abrirConfirmacao(btn.dataset.id);
    });
  });
}

// ---------- Abrir Modal para novo serviço ----------
document.getElementById('btnAdd').addEventListener('click', () => {
  abrirModal('Adicionar Serviço');
});

// ---------- Confirmar Remoção ----------
btnConfirmar.addEventListener('click', async () => {
  if (idParaRemover) {
    await fetch(`${url}/${idParaRemover}`, { method: 'DELETE' });
    mostrarMensagem("Serviço removido!");
    fecharConfirmacao();
    carregarServicos();
  }
});

// ---------- Salvar (Adicionar ou Editar) ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('servicoId').value;

  const novoServico = {
    titulo: document.getElementById('titulo').value,
    descricao: document.getElementById('descricao').value,
    preco: document.getElementById('preco').value,
    duracao: document.getElementById('duracao').value
  };

  if (id) {
    await fetch(`${url}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoServico)
    });
    mostrarMensagem("Serviço atualizado!");
  } else {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoServico)
    });
    mostrarMensagem("Serviço adicionado!");
  }

  fecharModal();
  carregarServicos();
});

carregarServicos();
