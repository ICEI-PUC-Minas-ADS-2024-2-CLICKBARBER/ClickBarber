const btnEntrar = document.getElementById("btnEntrar");
const check = document.getElementById("check");

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

btnEntrar.addEventListener('click',(event)=>{

    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

    //pega os valores de cada campo
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    var valid = true;

    //verifica o campo email
    if(!email || email === ""){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }
    else if(!/@/.test(email)){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }

    //verifica o campo senha
    if(!senha || senha === ""){
        valid = false;
        document.getElementById("inSenha").style.display="flex";
    }


    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
})