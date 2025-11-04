
const btnRedefinir = document.getElementById("btnRedefinir");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");
const url = "http://localhost:3000"


//verifica se a senha tem no minimo 1 letra 1 numero e 1 simbolo
async function verificaSenha(senha){
    if(senha.length <9)
        return false
    const letra = /[a-zA-Z]/.test(senha);
    const num = /\d/.test(senha);
    const simbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

    return num && letra && simbolo
}

//função que muda o cabeçalho
window.addEventListener('DOMContentLoaded', async function() {
    
    let noLogin = true

    //verifica se tem uma conta de usuario logada
    if(!(await verificaLogin(localStorage.getItem('token_u') , 'u'))){
        //se tiver muda o cabeçalho
        document.getElementById('navbarI').style.display = 'none'
        document.getElementById('navbarU').style.display = 'flex'
        document.getElementById('navbarB').style.display = 'none'
        noLogin = false
    }
    //verifica se tem uma conta de barbearia logada
    if(!(await verificaLogin(localStorage.getItem('token_b') , 'b'))){
        //se tiver muda o cabeçalho (mesmo se tiver uma conta de usuario logada ao mesmo tempo, o cabeçalho ira mudar)
        document.getElementById('navbarI').style.display = 'none'
        document.getElementById('navbarU').style.display = 'none'
        document.getElementById('navbarB').style.display = 'flex'
        noLogin = false
    }
    //se não tiver nenhuma conta logada o cabeçalho volta pro padrão
    if(noLogin == true){
        //volta pro cabeçalho padrão
        document.getElementById('navbarI').style.display = 'flex'
        document.getElementById('navbarU').style.display = 'none'
        document.getElementById('navbarB').style.display = 'none'
    }
})

//funções que mostram e ocultam a senha
check.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox");
    const senha = document.getElementById("senha");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check.checked){
        img.src = "assets/img/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "assets/img/olho.png"
        senha.type = "password"
    }

})
check2.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox2");
    const senha = document.getElementById("senhaConfirm");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check2.checked){
        img.src = "assets/img/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "assets/img/olho.png"
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

    else{

        //verifica se a senha esta no formato correto
        if(!verificaSenha(senha)){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }

        //verifica o campo confirmação de senha
        else if(senha!==senha2){
            valid = false;
            document.getElementById("inSenha2").style.display="flex";
        }
    }
    
    if(!(await alteraSenha(senha))){
        alert("Ocorreu um erro, tente novamente")
        valid = false
    }

    //se algum campo estiver invalido o envio não ira acontecer
    if(!valid)
        event.preventDefault();
    else{
        sessionStorage.removeItem('ts');
        window.location.href = "login_u.html";
    }
})

async function alteraSenha(senha){
    const token = sessionStorage.getItem('ts');

    if(!token)
        return false;

    try{

        const response = await fetch(url + "/usuarios/senha" , {
            method : "PATCH",
            headers : {
                "Content-Type" : "application/json",
                "authorization" : "Bearer "+token
            },
            body: JSON.stringify({senha : senha})
        })

        if(!response.ok)
            return false

        return true

    }catch(error){
        return console.log(error);
    }
}

//função que verifica se existe uma conta (usuario ou barbearia) logada
async function verificaLogin(token , l){

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
        //se não for válido tira ele do localStorage
        if(!response.ok){
            localStorage.removeItem('token_'+l)
            return true;
        }

        return false;
    }
}