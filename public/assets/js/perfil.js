// Senha correta para teste
const senhaCorreta = "123456";

let elementoAtual; // guarda qual elemento vai ser alterado
let tipoAtual; // 'logo', 'descricao', 'endereco'

const popup = document.getElementById('popup-senha');
const senhaInput = document.getElementById('senha-input');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Botões do perfil
document.getElementById('alterar-logo-btn').addEventListener('click', () => {
  tipoAtual = 'logo';
  popup.style.display = 'flex';
});

document.getElementById('editar-descricao-btn').addEventListener('click', () => {
  tipoAtual = 'descricao';
  popup.style.display = 'flex';
});

document.getElementById('editar-endereco-btn').addEventListener('click', () => {
  tipoAtual = 'endereco';
  popup.style.display = 'flex';
});

// Cancelar pop-up
cancelBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  senhaInput.value = '';
});

// Confirmar alteração
confirmBtn.addEventListener('click', () => {
  const senha = senhaInput.value;
  if(senha !== senhaCorreta){
    alert("Senha incorreta!");
    senhaInput.value = '';
    return;
  }

  if(tipoAtual === 'logo'){
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.onchange = e => {
      const file = e.target.files[0];
      if(file){
        const reader = new FileReader();
        reader.onload = () => {
          document.getElementById('logo-img').src = reader.result;
        }
        reader.readAsDataURL(file);
      }
    }
    inputFile.click();
  }

  if(tipoAtual === 'descricao'){
    const novaDesc = prompt("Digite a nova descrição:");
    if(novaDesc) document.getElementById('descricao-text').textContent = novaDesc;
  }

  if(tipoAtual === 'endereco'){
    const novoEnd = prompt("Digite o novo endereço:");
    if(novoEnd) document.getElementById('endereco-text').textContent = novoEnd;
  }

  popup.style.display = 'none';
  senhaInput.value = '';
});
