const url = 'http://localhost:3000/usuarios'
const btnCriar =  document.getElementById("btnCria");
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
btnCriar.addEventListener('click', async (event) => {
    
    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

    //pega os valores de cada campo
    const email = document.getElementById("email").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const senha2 = document.getElementById("senhaConfirm").value.trim();

    var valid = true;

    //verifica o campo email
    if(!email || email === ""){
        valid = false;
        document.getElementById("inEmail").style.display="flex";
    }
    else if(!/@/.test(email)){
        valid = false;
        document.getElementById("inEmail").style.display="flex";
    }
    else{
        if(!(await procuraDado('email',email))){
            valid = false
            document.getElementById("inEmail2").style.display="flex";
        }
    }

    //verifica o campo nome
    if(!nome || nome === ""){
        valid = false;
        document.getElementById("inNome").style.display="flex";
    }

    //verifica o campo sobrenome
    if(!sobrenome || sobrenome === ""){
        valid = false;
        document.getElementById("inSobrenome").style.display="flex";
    }

    //verifica o campo telefone
    if(!telefone || telefone === ""){
        valid = false;
        document.getElementById("inTele").style.display="flex";
    }
    else if(!telefone.length == 10){
        valid = false;
        document.getElementById("inTele").style.display="flex";
    }

    //verifica o campo CPF
    if(!cpf || cpf === ""){
        valid = false;
        document.getElementById("inCPF").style.display="flex";
    }
    else if(!cpf.length == 11){
        valid = false;
        document.getElementById("inCPF").style.display="flex";
    }
    else{
        if(!(await procuraDado('cpf',cpf))){
            valid = false
            document.getElementById("inCPF2").style.display="flex";
        }
    }

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
    if(valid==false)
        event.preventDefault();
    else{
        var valores = 
        {
            "email":email,
            "nome": nome + ' ' + sobrenome,
            "telefone":telefone,
            "cpf":cpf,
            "senha":senha,
        }

        if(cadastraUsuario(valores))
            window.location.href = "login.html"
    }
        
})

async function cadastraUsuario(valores){

    try{
        await fetch(url,{
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(valores)
        })
    }
    catch(err){
        Console.Log(`Ocorreu um erro ${err}:`)
        alert('Ocorreu um erro, por favor tente de novo')
        return false
    }
    return true
}

async function procuraDado(nome, dado){

    console.log(url+ '?' +nome+ '=' +dado)
    
    const response =  await fetch(url+ '?' +nome+ '=' +dado)

    if(!response.ok){
        throw new Error('Ocorreu um erro')
    }

    const data = await response.json()

    console.log(data)
    console.log(data.length ==0)

    return data.length == 0

}