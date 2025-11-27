const btnEntrar = document.getElementById("btnEntrar");
const check = document.getElementById("check");
const url = 'http://localhost:3000'

//função que muda o cabeçalho
window.addEventListener('DOMContentLoaded', async function() {
    
    let noLogin = true

    //pega a navbar de cada tipo
    const navbarI = document.getElementById('navbarI')
    const navbarB = document.getElementById('navbarB')

    //verifica se tem uma conta de barbearia logada
    if(!(await verificaLogin(localStorage.getItem('token_b')))){
        //se tiver muda o cabeçalho
        navbarI.style.display = 'none'
        navbarB.style.display = 'flex'
        noLogin = false
    }
    //se não tiver nenhuma conta logada o cabeçalho volta pro padrão
    if(noLogin == true){
        //se não tiver muda o cabeçalho e redireciona pra página de login de barbearia
        window.location.href = "login_b.html"
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

btnEntrar.addEventListener('click' , async (event) =>{
    document.querySelector('#inSenha').style.display = 'none' //some com a div invalid

    const senha = document.getElementById('senha').value ; //pega o valor do input senha

    let valid = true //usada pra impedir o envio do form caso seja false
    let response //usada pra guardar a response

    //verifica se o valor da senha existe
    if(!senha || senha.length <=0){
        document.getElementById('inSenha').style.display = 'flex'
        valid = false
    }
    else{
        //faz a requisição com o token contendo os dados da barbearia presente no localStorage e o valor da senha
        response = await fetch(url+'/barbearias/authLogs' ,{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
                authorization: 'Bearer '+localStorage.getItem('token_b')
            },
            body : JSON.stringify({senha:senha})
        })
    }

    //variavel que guarda os dados
    let dados = ''

    //verifica se deu erro na requisição
    if(!response.ok){
        document.getElementById('inSenha').style.display = 'flex'
        valid = false
    }
    //se não deu pega os dados enviados (CNPJ da barbearia)
    else
        dados = await response.json()

    if(!valid)
        event.preventDefault();
    else{
        //põe o token vindo da requisição no session storage
        //esse token contem o cnpj da barbearia que será usado pra identificar de qual barbearia os logs deverão ser pegos
        sessionStorage.setItem('tl' , dados.token)
        window.location.href = 'logs.html' //envia pra página de logs
    }
})


//função que verifica se existe uma conta (usuario ou barbearia) logada
async function verificaLogin(token){

    //verifica se o token existe
    if(token == null)
        return true

    else{
        //faz uma requisição pra ver se o token é válido
        const response = await fetch(url+"/login/verify" ,{
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
        //se não for válido retorna true
        if(!response.ok)
            return true;

        return false;
    }
}