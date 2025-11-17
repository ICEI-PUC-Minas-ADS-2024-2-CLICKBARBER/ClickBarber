const btnEntrar = document.getElementById("btnEntrar");
const url = "http://localhost:3000"

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

btnEntrar.addEventListener('click', async (event)=>{

    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

    //pega os valores de cada campo
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();

    var valid = true;

    //verifica o campo email
    if(!email || email === ""){
        valid = false;
        document.getElementById("invalid").style.display="flex";
    }
    else if(!/@/.test(email)){
        valid = false;
        document.getElementById("invalid").style.display="flex";
    }
    //verifica se o email ja existe no banco de dados
    else if(!(await procuraDado('email',email))){
        valid = false
        document.getElementById("invalid").style.display="flex";
    }
    else{
        console.log(cpf.length != 11)
        //verifica o campo CPF
        if(!cpf || cpf === ""){
            valid = false;
            document.getElementById("invalid").style.display="flex";
        }
        else if(cpf.length != 11){
            valid = false;
            document.getElementById("invalid").style.display="flex";
        }
        //verifica se o cpf ja existe no banco de dados
        else if(!(await procuraDado('cpf',cpf))){
            valid = false
            document.getElementById("invalid").style.display="flex";
        }
    }

    //verifica se o cpf e o email foram cadastrados pelo mesmo usuario. Se sim cria um token de autorização para a alteração de senha
    const token = await verificaDados(email , cpf)

    //verifica se o token existe
    if(!token){
        valid = false;
        document.getElementById("invalid").style.display="flex";
    }

    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
    else{
        //se existir coloca o token no session storage e redireciona o usuario pra página de alteração de senha
        sessionStorage.setItem("ts" , token)
        window.location.href = "redef_senha.html"
    }
})

//função que procura um dado no backend
async function procuraDado(nome, dado){

    //faz a requisição para o backend
    const response =  await fetch(url+ '/usuarios/' +nome , {
        method: "POST",
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({[nome]: dado})
    })
    
    //verifica se a requisição foi bem sucedida
    if(!response.ok){
        alert(response.message)
        return false
    }

    //pega os dados retornados
    const data = await response.json()

    //retorna se o dado foi encontrado ou não(true se sim, flase se não)
    return data.cadastrado
}

//função que verifica se o cpf e o email foram cadastrados pelo mesmo usuário
async function verificaDados(email , cpf){

    const response = await fetch(url+ "/usuarios/cpf-email" , {
        method: 'POST',
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({
            email : email,
            cpf : cpf
        })
    })

    if(!response.ok)
        return false;

    const data = await response.json();

    //retorna o token enviado como resposta
    return data.token;
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