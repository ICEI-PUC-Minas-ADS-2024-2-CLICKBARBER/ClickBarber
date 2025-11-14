// Senha verdadeira
const senhaCorreta = "123456";
let tipoAtual = null; 

const popup = document.getElementById('popup-senha');
const popupContent = document.getElementById('popup-content');

// Função para abrir popup pedindo senha
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

// Fechar popup
function fecharPopup() {
  popup.style.display = 'none';
  popupContent.innerHTML = "";
}

// Validar senha
function validarSenha() {
  const senhaDigitada = document.getElementById('senha-input').value;

  if (senhaDigitada !== senhaCorreta) {
    alert("Senha incorreta!");
    return;
  }

  // senha correta -> ir para edição
  mostrarCampoEdicao(); 
}

// Mostra o campo de edição após senha correta
function mostrarCampoEdicao() {

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
      const imagem = document.getElementById("input-logo").files[0];
      if (!imagem) return;

      const leitor = new FileReader();
      leitor.onload = () => {
        document.getElementById("logo").src = reader.result;
      };
      leitor.readAsDataURL(arquivo);
      fecharPopup();
    };

  } else {
    // descrição, endereço ou nome
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

    // confirma a edição pegando o valor do input e atualizando na pagina em si(ainda sem db)
    document.getElementById("confirm-editar-btn").onclick = () => {
      const novoTexto = document.getElementById("novo-valor").value;
      document.getElementById(tipoAtual).textContent = novoTexto;
      fecharPopup();
    };
  }
}

// Botões que iniciam a edição
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
