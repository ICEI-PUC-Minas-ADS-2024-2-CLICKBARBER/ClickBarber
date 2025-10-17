const listaServicos = document.getElementById('listaServicos');
const url = "http://localhost:3000/servicos";

async function carregarServicos() {
  const res = await fetch(url);
  const servicos = await res.json();

  listaServicos.innerHTML = '';

  servicos.forEach(s => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <h2>${s.titulo}</h2>
      <p>${s.descricao}</p>
      <p><strong>Preço:</strong> R$${s.preco}</p>
      <p><strong>Duração:</strong> ${s.duracao}</p>
      <p><strong>ID:</strong> ${s.id}</p>
    `;
    listaServicos.appendChild(div);
  });
}

// Adicionar
document.getElementById('btnAdd').addEventListener('click', async () => {
  const titulo = prompt("Título do serviço:");
  const descricao = prompt("Descrição:");
  const preco = prompt("Preço:");
  const duracao = prompt("Duração (ex: 30min):");

  if (titulo && descricao && preco && duracao) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descricao, preco, duracao })
    });
    carregarServicos();
  }
});

// Editar
document.getElementById('btnEdit').addEventListener('click', async () => {
  const id = prompt("ID do serviço que deseja editar:");
  const res = await fetch(`${url}/${id}`);
  if (!res.ok) {
    alert("Serviço não encontrado!");
    return;
  }
  const servico = await res.json();

  const titulo = prompt("Novo título:", servico.titulo);
  const descricao = prompt("Nova descrição:", servico.descricao);
  const preco = prompt("Novo preço:", servico.preco);
  const duracao = prompt("Nova duração:", servico.duracao);

  await fetch(`${url}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, descricao, preco, duracao })
  });
  carregarServicos();
});

// Remover
document.getElementById('btnRemove').addEventListener('click', async () => {
  const id = prompt("ID do serviço a remover:");
  await fetch(`${url}/${id}`, { method: 'DELETE' });
  carregarServicos();
});

carregarServicos();
