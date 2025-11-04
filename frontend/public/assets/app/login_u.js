const url = 'http://localhost:3000'
const btnEntrar = document.getElementById("btnEntrar");
const check = document.getElementById("check");

//função que muda o cabeçalho
window.addEventListener('DOMContentLoaded', async function() {
    
    let noLogin = true

    //verifica se tem uma conta de usuario logada
    if(!(await verificaLogin(localStorage.getItem('token_u') , 'u'))){
        //coloca um aviso embaixo do botão de fazer login
        document.querySelector('.btn').style.marginBottom = '0px'
        document.getElementById('inLogin').style.display = 'flex'
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
        //coloca um aviso embaixo do botão de fazer login
        document.querySelector('.btn').style.marginBottom = '41.11px'
        document.getElementById('inLogin').style.display = 'none'
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

btnEntrar.addEventListener('click',async (event)=>{

    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        if(element.id != 'inLogin')
            element.style.display = "none"
    })

    //pega os valores de cada campo
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    var valid = true;

    valid = await verificaLogin(localStorage.getItem('token_u') , 'u');

    if(valid == true){

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

    //retorna se o dado foi encontrado ou não(true se sim, false se não)
    return data.cadastrado
}

//função que faz o login
async function fazLogin(email,senha){

    //faz a requisição para o backend
    const response = await fetch(url+'/login/usuarios' ,{
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
        localStorage.setItem('token_u', data.token);
        return true;
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