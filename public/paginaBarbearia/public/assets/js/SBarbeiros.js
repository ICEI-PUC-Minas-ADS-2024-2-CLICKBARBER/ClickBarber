/**
 * SBarbeiros.js
 * - Carrega barbeiros do endpoint /api/barbeiros
 * - Mostra na lista #listaBarbeiros
 * - Filtra localmente conforme input #searchBarbeiro
 * - Ao clicar em um barbeiro abre areaServicos (se desejar)
 */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchBarbeiro");
  const lista = document.getElementById("listaBarbeiros");
  const areaServicos = document.getElementById("areaServicos");
  const dropdownServicos = document.getElementById("dropdownServicos");
  const btnSalvar = document.getElementById("btnSalvar");

  let barbeiros = [];
  let servicos = [];
  let selecionado = null;

  // carrega barbeiros do servidor
  async function carregarBarbeiros() {
    try {
      const res = await fetch("/api/barbeiros");
      barbeiros = await res.json();
      renderLista(barbeiros);
    } catch (err) {
      console.error("Erro carregar barbeiros:", err);
    }
  }

  // carrega serviços (se existirem)
  async function carregarServicos() {
    try {
      const res = await fetch("/api/servicos");
      servicos = await res.json();
      renderServicos(servicos);
    } catch (err) {
      console.warn("Não foi possível carregar serviços (ou tabela vazia).", err);
      servicos = [];
      dropdownServicos.innerHTML = "<option>Sem serviços</option>";
    }
  }

  function renderLista(items) {
    lista.innerHTML = "";
    if (!items.length) {
      lista.innerHTML = "<li class='list-group-item'>Nenhum barbeiro encontrado</li>";
      return;
    }
    items.forEach(b => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.style.cursor = "pointer";
      li.textContent = `${b.Nome} — ${b.Numero_telefone || "sem telefone"}`;
      li.dataset.id = b.ID_pessoa || b.id_pessoa || "";
      li.addEventListener("click", () => selecionarBarbeiro(b));
      lista.appendChild(li);
    });
  }

  function renderServicos(list) {
    dropdownServicos.innerHTML = "";
    if (!list.length) {
      dropdownServicos.innerHTML = "<option value=''>Sem serviços</option>";
      return;
    }
    list.forEach(s => {
      dropdownServicos.innerHTML += `<option value="${s.ID_servico}">${s.Titulo} — R$ ${s.Preco || "-"}</option>`;
    });
  }

  function selecionarBarbeiro(b) {
    selecionado = b;
    areaServicos.style.display = "block";
  }

  // filtro
  if (input) {
    input.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = barbeiros.filter(b => b.Nome.toLowerCase().includes(q));
      renderLista(filtered);
    });
  }

  // salvar vínculo barbeiro-serviço
  if (btnSalvar) {
    btnSalvar.addEventListener("click", async () => {
      if (!selecionado) return alert("Selecione um barbeiro primeiro.");
      const id_pessoa = selecionado.ID_pessoa || selecionado.id_pessoa;
      const id_servico = dropdownServicos.value;
      if (!id_servico) return alert("Selecione um serviço.");

      const res = await fetch("/api/pessoa-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pessoa, id_servico })
      });
      const data = await res.json();
      if (res.ok) alert(data.message || "Vinculado");
      else alert("Erro ao vincular (ver console).");
    });
  }

  // init
  carregarBarbeiros();
  carregarServicos();
});
