const btnRedefinir = document.getElementById("btnRedefinir");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");


//verifica se a senha tem no minimo 1 letra 1 numero e 1 simbolo
function verificaSenha(senha){
    const letra = /[a-zA-Z]/.test(senha);
    const num = /\d/.test(senha);
    const simbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);

    return num && letra && simbolo
}

//funções que mostram e ocultam a senha
check.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox");
    const senha = document.getElementById("senha");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check.checked){
        img.src = "src/img/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "src/img/olho.png"
        senha.type = "password"
    }

})
check2.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox2");
    const senha = document.getElementById("senhaConfirm");

    //se estiver checado a senha ira aparecer e o botão ira mudar para o olho aberto
    if(check2.checked){
        img.src = "src/img/olhon.png"
        senha.type = "text"
    }
    //se não a senha vai ser ocultada e a imagem ira mudar para o olho bloqueado
    else{
        img.src = "src/img/olho.png"
        senha.type = "password"
    }

})

//função que verifica se todos os campos estão preenchidos de forma correta
btnRedefinir.addEventListener('click', (event) => {
    
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

        if(senha.length <9){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }

        else if(!verificaSenha(senha)){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }

        //verifica o campo confirmação de senha
        else if(senha!==senha2){
            valid = false;
            document.getElementById("inSenha2").style.display="flex";
        }
    }
    
    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
})