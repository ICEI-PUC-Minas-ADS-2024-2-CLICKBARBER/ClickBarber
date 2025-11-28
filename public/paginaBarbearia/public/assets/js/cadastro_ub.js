const urlBase = "http://localhost:4060/barbeiros";

const btnCriar = document.getElementById("btnCria");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");

// Campos do formulário
const email = document.getElementById("email");
const nome = document.getElementById("nome");
const sobrenome = document.getElementById("sobrenome");
const telefone = document.getElementById("telefone");
const cpf = document.getElementById("cpf");
const senha = document.getElementById("senha");
const senhaConfirm = document.getElementById("senhaConfirm");

// Mensagens de erro
const inEmail = document.getElementById("inEmail");
const inEmail2 = document.getElementById("inEmail2");
const inNome = document.getElementById("inNome");
const inSobrenome = document.getElementById("inSobrenome");
const inTele = document.getElementById("inTele");
const inCPF = document.getElementById("inCPF");
const inCPF2 = document.getElementById("inCPF2");
const inSenha = document.getElementById("inSenha");
const inSenha2 = document.getElementById("inSenha2");

// Função para mostrar/ocultar senha
if (check) {
check.addEventListener("click", () => {
senha.type = check.checked ? "text" : "password";
});
}
if (check2) {
check2.addEventListener("click", () => {
senhaConfirm.type = check2.checked ? "text" : "password";
});
}

// Funções de validação
function validaEmail(email) {
const regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
return regex.test(email);
}

function validaSenha(senha) {
// mínimo 8 caracteres, pelo menos 1 letra, 1 número e 1 símbolo
const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
return regex.test(senha);
}

function validaCPF(cpf) {
return cpf.toString().length === 11;
}

function limpaErros() {
inEmail.style.display = "none";
inEmail2.style.display = "none";
inNome.style.display = "none";
inSobrenome.style.display = "none";
inTele.style.display = "none";
inCPF.style.display = "none";
inCPF2.style.display = "none";
inSenha.style.display = "none";
inSenha2.style.display = "none";
}

// Envio do formulário
btnCriar.addEventListener("click", async () => {
limpaErros();
let erro = false;

if (!validaEmail(email.value)) {
inEmail.style.display = "block";
erro = true;
}
if (!nome.value.trim()) {
inNome.style.display = "block";
erro = true;
}
if (!sobrenome.value.trim()) {
inSobrenome.style.display = "block";
erro = true;
}
if (!telefone.value.trim() || isNaN(telefone.value)) {
inTele.style.display = "block";
erro = true;
}
if (!validaCPF(cpf.value)) {
inCPF.style.display = "block";
erro = true;
}
if (!validaSenha(senha.value)) {
inSenha.style.display = "block";
erro = true;
}
if (senha.value !== senhaConfirm.value) {
inSenha2.style.display = "block";
erro = true;
}

if (erro) return;

// Checar duplicados no banco
try {
const res = await fetch(urlBase);
const dados = await res.json();

```
if (dados.some(u => u.email === email.value)) {
  inEmail2.style.display = "block";
  return;
}
if (dados.some(u => u.cpf === cpf.value)) {
  inCPF2.style.display = "block";
  return;
}

// Monta objeto para envio
const novoBarbeiro = {
  email: email.value,
  nome: nome.value,
  sobrenome: sobrenome.value,
  telefone: telefone.value,
  cpf: cpf.value,
  senha: senha.value
};

// Envia para API
const resposta = await fetch(urlBase, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(novoBarbeiro)
});

if (resposta.ok) {
  alert("Barbeiro cadastrado com sucesso!");
  // Limpa formulário
  email.value = "";
  nome.value = "";
  sobrenome.value = "";
  telefone.value = "";
  cpf.value = "";
  senha.value = "";
  senhaConfirm.value = "";
} else {
  alert("Erro ao cadastrar barbeiro.");
}
```

} catch (err) {
console.error(err);
alert("Erro na comunicação com o servidor.");
}
});
