/**
 * cadastro_ub.js
 * - Valida campos no front (igual lógica que você já tinha)
 * - Verifica duplicidade chamando GET /api/pessoas?email=... ou ?cpf=...
 * - Ao finalizar envia POST /api/pessoas para cadastrar barbeiro (Pessoa)
 *
 * IDs usados no HTML:
 * #email #nome #sobrenome #telefone #cpf #senha #senhaConfirm #btnCria
 *
 */

const urlBase = "/api/pessoas"; // endpoint do servidor

const btnCriar = document.getElementById("btnCria");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");

// reutilizei suas funções de mostrar/ocultar senha
if (check) {
  check.addEventListener("click", () => {
    const img = document.getElementById("imgCheckBox");
    const senha = document.getElementById("senha");
    if (check.checked) {
      img.src = "assets/img/olhon.png";
      senha.type = "text";
    } else {
      img.src = "assets/img/olho.png";
      senha.type = "password";
    }
  });
}
if (check2) {
  check2.addEventListener("click", () => {
    const img = document.getElementById("imgCheckBox2");
    const senha = document.getElementById("senhaConfirm");
    if (check2.checked) {
      img.src = "assets/img/olhon.png";
      senha.type = "text";
    } else {
      img.src = "assets/img/olho.png";
      senha.type = "password";
    }
  });
}

function verificaSenha(senha) {
  const letra = /[a-zA-Z]/.test(senha);
  const num = /\d/.test(senha);
  const simbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);
  return num && letra && simbolo;
}

// procura se existe dado no backend (email ou cpf)
async function procuraDado(nome, dado) {
  try {
    const q = nome === "email" ? `?email=${encodeURIComponent(dado)}` : `?cpf=${encodeURIComponent(dado)}`;
    const res = await fetch(`/api/pessoas${q}`);
    if (!res.ok) {
      console.error("Erro procuraDado", res.status);
      return false;
    }
    const arr = await res.json();
    return arr.length > 0;
  } catch (err) {
    console.error("procuraDado erro:", err);
    return false;
  }
}

// cadastra no backend
async function cadastraUsuario(valores) {
  try {
    const response = await fetch("/api/pessoas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores)
    });
    if (!response.ok) {
      console.error("Erro ao cadastrar:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Erro fetch cadastrar:", error);
    return false;
  }
}

// evento do botão cadastrar (mantive sua validação original)
if (btnCriar) {
  btnCriar.addEventListener("click", async (event) => {
    document.querySelectorAll(".invalid").forEach(el => el.style.display = "none");

    const email = document.getElementById("email").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const senha2 = document.getElementById("senhaConfirm").value.trim();

    let valid = true;

    // email
    if (!email || !/@/.test(email)) {
      valid = false;
      document.getElementById("inEmail").style.display = "flex";
    } else if (await procuraDado('email', email)) {
      valid = false;
      document.getElementById("inEmail2").style.display = "flex";
    }

    // nome
    if (!nome) {
      valid = false;
      document.getElementById("inNome").style.display = "flex";
    }

    // sobrenome
    if (!sobrenome) {
      valid = false;
      document.getElementById("inSobrenome").style.display = "flex";
    }

    // telefone
    if (!telefone) {
      valid = false;
      document.getElementById("inTele").style.display = "flex";
    }

    // cpf
    if (!cpf) {
      valid = false;
      document.getElementById("inCPF").style.display = "flex";
    } else if (await procuraDado('cpf', cpf)) {
      valid = false;
      document.getElementById("inCPF2").style.display = "flex";
    }

    // senha
    if (!senha) {
      valid = false;
      document.getElementById("inSenha").style.display = "flex";
    } else {
      if (senha.length < 9 || !verificaSenha(senha)) {
        valid = false;
        document.getElementById("inSenha").style.display = "flex";
      } else if (senha !== senha2) {
        valid = false;
        document.getElementById("inSenha2").style.display = "flex";
      }
    }

    if (!valid) {
      event.preventDefault();
      return;
    }

    // monta objeto adaptado para a API
    const valores = {
      email,
      nome: nome + " " + sobrenome,
      telefone,
      cpf,
      senha
    };

    const ok = await cadastraUsuario(valores);
    if (ok) {
      // Se quiser redirecionar para login.html (se existir)
      window.location.href = "login.html";
    } else {
      alert("Erro ao cadastrar, verifique o console.");
    }
  });
}
