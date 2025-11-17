
const btnRedefinir = document.getElementById("btnRedefinir");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");
const url = "http://localhost:3000"

//verifica se a senha tem no minimo 1 letra 1 numero e 1 simbolo
async function verificaSenha(senha){
    const letra = /[a-zA-Z]/.test(senha);
    const num = /\d/.test(senha);
    const simbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

    return num && letra && simbolo
}

//função que muda o cabeçalho
window.addEventListener('DOMContentLoaded', async function() {
    let noLogin = true

    //pega a navbar de cada tipo
    const navbarI = document.getElementById('navbarI')
    const navbarU = document.getElementById('navbarU')
    const navbarB = document.getElementById('navbarB')

    //verifica se tem uma conta de usuario logada
    if(!(await verificaLogin(localStorage.getItem('token_u')))){
        window.location.href = "home.html"
        noLogin = false
    }
    //verifica se tem uma conta de barbearia logada
    if(!(await verificaLogin(localStorage.getItem('token_b')))){
        //se tiver muda o cabeçalho (mesmo se tiver uma conta de usuario logada ao mesmo tempo, o cabeçalho ira mudar)
        navbarB.style.display = 'flex'
        navbarI.style.display = 'none'
        navbarU.style.display = 'none'
        
        noLogin = false
    }
    //se não tiver nenhuma conta logada o cabeçalho volta pro padrão
    if(noLogin == true){
        //volta pro cabeçalho padrão
       navbarI.style.display = 'flex'
       navbarU.style.display = 'none'
       navbarB.style.display = 'none'
    }
})

//funções que mostram e ocultam a senha
check.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox");
    const senha = document.getElementById("senha");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check.checked){
        img.src = "assets/imagens/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "assets/imagens/olho.png"
        senha.type = "password"
    }
})
check2.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox2");
    const senha = document.getElementById("senhaConfirm");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check2.checked){
        img.src = "assets/imagens/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "assets/imagens/olho.png"
        senha.type = "password"
    }

})

//função que verifica se todos os campos estão preenchidos de forma correta
btnRedefinir.addEventListener('click', async (event) => {
    
    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

    const senha = document.getElementById("senha").value.trim();;
    const senha2 = document.getElementById("senhaConfirm").value.trim();;

    var valid = true;

    //verifica o campo senha
    if(!senha || senha === ""){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }
    //verifica se a senha tem o tamanho mínimo
    else if(senha.length <9){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }
    //verifica se a senha esta no formato correto
    else if(!verificaSenha(senha)){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }
    //verifica o campo confirmação de senha
    else if(senha!==senha2){
        valid = false;
        document.getElementById("inSenha2").style.display="flex";
    }

    //altera a senha no banco de dados
    if(!(await alteraSenha(senha))){
        alert("Ocorreu um erro, tente novamente")
        valid = false
    }

    //se algum campo estiver invalido o envio não ira acontecer
    if(!valid)
        event.preventDefault();
    else{
        sessionStorage.removeItem('ts');
        window.location.href = "login_u.html"
    }
})

//função que altera a senha por uma nova
async function alteraSenha(senha){
    //pega o token de autorização no session storage
    const token = sessionStorage.getItem('ts');

    //verifica se ele existe
    if(!token)
        return false;

    try{
        //envia o token por requisição junto com a nova senha
        const response = await fetch(url + "/usuarios/senha" , {
            method : "PATCH",
            headers : {
                "Content-Type" : "application/json",
                "authorization" : "Bearer "+token
            },
            body: JSON.stringify({senha : senha})
        })

        //verifica se a senha foi alterada
        if(!response.ok)
            return false

        return true

    }catch(error){
        return console.log(error);
    }
}

//função que verifica se existe uma conta (usuario ou barbearia) logada
async function verificaLogin(token){

    //verifica se o token existe
    if(token == null){
        return true
    }
    else{
        //faz uma requisição pra ver se o token é válido
        const response = await fetch(url+"/login/verify" ,{
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
        //se não for válido retorna true
        if(!response.ok){
            return true;
        }

        return false;
    }
}