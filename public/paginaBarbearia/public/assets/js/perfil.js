/**
 * perfil.js
 * - Controla o popup de edição de perfil da barbearia
 * - Ao confirmar faz PUT /api/barbearia/update { campo, valor }
 * - Usa CNPJ_PADRAO no backend (não precisa enviar id)
 */

const popup = document.getElementById('popup-senha');
const popupContent = document.getElementById('popup-content');
const senhaCorreta = "123456"; // mantenha se quiser (apenas teste)
let tipoAtual = null;

function abrirPopupSenha() {
  popup.style.display = 'flex';
  popupContent.innerHTML = `
    <h3>Digite sua senha para confirmar</h3>
    <input type="password" id="senha-input" placeholder="Senha">
    <div class="popup-buttons">
      <button id="confirm-senha-btn" class="custom-btn">Confirmar</button>
      <button id="cancel-btn" class="custom-btn">Cancelar</button>
    </div>
  `;
  document.getElementById('cancel-btn').onclick = fecharPopup;
  document.getElementById('confirm-senha-btn').onclick = validarSenha;
}

function fecharPopup() {
  popup.style.display = 'none';
  popupContent.innerHTML = "";
}

function validarSenha() {
  const senhaDigitada = document.getElementById('senha-input').value;
  if (senhaDigitada !== senhaCorreta) {
    alert("Senha incorreta!");
    return;
  }
  mostrarCampoEdicao();
}

async function salvarNoBanco(campo, valor) {
  try {
    const res = await fetch("/api/barbearia/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo, valor })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("Alteração salva com sucesso!");
      return true;
    } else {
      alert("Erro ao salvar no banco!");
      console.error("resposta:", data);
      return false;
    }
  } catch (err) {
    console.error(err);
    alert("Falha ao conectar com o servidor.");
    return false;
  }
}

function mostrarCampoEdicao() {
  if (tipoAtual === "logo") {
    // você disse que não vai usar imagens — então avisamos e cancelamos
    popupContent.innerHTML = `
      <h3>Alteração de logo não suportada (sem imagens)</h3>
      <div class="popup-buttons">
        <button id="cancel-btn" class="custom-btn">Fechar</button>
      </div>
    `;
    document.getElementById("cancel-btn").onclick = fecharPopup;
    return;
  }

  const valorAtual = document.getElementById(tipoAtual).textContent;

  popupContent.innerHTML = `
      <h3>Digite o novo valor</h3>
      <input type="text" id="novo-valor" value="${valorAtual}">
      <div class="popup-buttons">
        <button id="confirm-editar-btn" class="custom-btn">Confirmar</button>
        <button id="cancel-btn" class="custom-btn">Cancelar</button>
      </div>
  `;

  document.getElementById("cancel-btn").onclick = fecharPopup;

  document.getElementById("confirm-editar-btn").onclick = async () => {
    const novoTexto = document.getElementById("novo-valor").value.trim();
    if (novoTexto.length < 2) {
      alert("O texto está muito curto.");
      return;
    }
    // atualiza visualmente
    document.getElementById(tipoAtual).textContent = novoTexto;
    // salva no banco (campo deve estar na whitelist do servidor)
    await salvarNoBanco(tipoAtual, novoTexto);
    fecharPopup();
  };
}

// bind dos botões (assegure ids existirem no HTML)
const bLogo = document.getElementById('alterar-logo-btn');
const bNome = document.getElementById('editar-nome-btn');
const bDesc = document.getElementById('editar-descricao-btn');
const bEnd = document.getElementById('editar-endereco-btn');

if (bLogo) bLogo.addEventListener('click', () => { tipoAtual = 'Imagem'; abrirPopupSenha(); });
if (bNome) bNome.addEventListener('click', () => { tipoAtual = 'Nome'; abrirPopupSenha(); });
if (bDesc) bDesc.addEventListener('click', () => { tipoAtual = 'Descricao'; abrirPopupSenha(); });
if (bEnd) bEnd.addEventListener('click', () => { tipoAtual = 'Rua_endereco'; abrirPopupSenha(); });
