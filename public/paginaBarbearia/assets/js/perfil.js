// Senha verdadeira
const senhaCorreta = "123456";
let tipoAtual = null;

const popup = document.getElementById('popup-senha');
const popupContent = document.getElementById('popup-content');

// ID da barbearia logada (DEPOIS você vai pegar do localStorage)
const BARBEARIA_ID = 1; 

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

// 🔥 FUNÇÃO CENTRAL: Envia atualização ao servidor
async function salvarNoBanco(campo, valor) {
  try {
    const response = await fetch("http://localhost:3000/barbearia/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: BARBEARIA_ID,
        campo,
        valor
      })
    });

    const data = await response.json();

    if (data.success) {
      alert("Alteração salva com sucesso!");
    } else {
      alert("Erro ao salvar no banco!");
    }

  } catch (err) {
    console.error(err);
    alert("Falha ao conectar com o servidor.");
  }
}

function mostrarCampoEdicao() {
  // ---- ALTERAR LOGO ----
  if (tipoAtual === "logo") {
    popupContent.innerHTML = `
      <h3>Selecione a nova logo</h3>
      <input type="file" id="input-logo" accept="image/*">
      <div class="popup-buttons">
        <button id="confirm-editar-btn" class="custom-btn">Confirmar</button>
        <button id="cancel-btn" class="custom-btn">Cancelar</button>
      </div>
    `;

    document.getElementById("cancel-btn").onclick = fecharPopup;

    document.getElementById("confirm-editar-btn").onclick = () => {
      const file = document.getElementById("input-logo").files[0];
      if (!file) {
        alert("Selecione uma imagem!");
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        document.getElementById("logo").src = reader.result;

        // salva no banco
        await salvarNoBanco("logo", reader.result);

        fecharPopup();
      };

      reader.readAsDataURL(file);
    };

    return;
  }

  // ---- EDITAR TEXTO (nome, descrição, endereço) ----
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

    // Atualiza na tela
    document.getElementById(tipoAtual).textContent = novoTexto;

    // Atualiza no banco
    await salvarNoBanco(tipoAtual, novoTexto);

    fecharPopup();
  };
}

// Botões
document.getElementById('alterar-logo-btn').addEventListener('click', () => {
  tipoAtual = 'logo';
  abrirPopupSenha();
});
document.getElementById('editar-nome-btn').addEventListener('click', () => {
  tipoAtual = 'nome';
  abrirPopupSenha();
});
document.getElementById('editar-descricao-btn').addEventListener('click', () => {
  tipoAtual = 'descricao';
  abrirPopupSenha();
});
document.getElementById('editar-endereco-btn').addEventListener('click', () => {
  tipoAtual = 'endereco';
  abrirPopupSenha();
});
