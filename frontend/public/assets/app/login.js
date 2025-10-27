const url = 'http://localhost:3000'
const btnEntrar = document.getElementById("btnEntrar");
const check = document.getElementById("check");

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

btnEntrar.addEventListener('click',async (event)=>{

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
    else{
        if(!(await procuraDado(email))){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }
        
        //verifica o campo senha
        else if(!senha || senha === ""){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }
    }

    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
    //se der true na verificação de login, redireciona para a home
    else if(await fazLogin(email,senha)){
        window.location.href = "home.html"
    }
})

//função que procura um dado no backend
async function procuraDado(dado){

    //faz a requisição para o backend
    const response =  await fetch(url+ '/usuarios/email' , {
        method: "POST",
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({email: dado})
    })
    
    //verifica se a requisição foi bem sucedida
    if(!response.ok){
        return false;
    }

    //pega os dados retornados
    const data = await response.json()

    //retorna se o dado foi encontrado ou não(true se sim, flase se não)
    return data.cadastrado
}

//função que faz o login
async function fazLogin(email,senha){

    //faz a requisição para o backend
    const response = await fetch(url+'/login' ,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    })

    //verifica se a requisição foi bem sucedida
    if(!response.ok){
        alert('Credenciais incorretas, por favor tente de novo')
        return false
    }
    else{
        //pega os dados retornados
        const data = await response.json();

        //salva o token no local storage
        localStorage.setItem('token', data.token);
        return true;
    }
}