const url = 'http://localhost:3000/usuarios'
const btnCriar =  document.getElementById("btnCria");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");

//só peguei emprestado do leonardo de usuario dele, ent eu não criei db.json nem nada para testar ainda.

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
    //verifica se o email ja existe no banco de dados
    else if(await procuraDado('email',email)){
        valid = false
        document.getElementById("inEmail2").style.display="flex";
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
    //verifica se o cpf ja existe no banco de dados
    else if(await procuraDado('cpf',cpf)){
        valid = false
        document.getElementById("inCPF2").style.display="flex";
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
        //cria o objeto com os valores
        var valores = 
        {
            "email":email,
            "nome": nome + ' ' + sobrenome,
            "telefone":telefone,
            "cpf":cpf,
            "senha":senha,
        }

        //chama a função que cadastra o usuario
        if(await cadastraUsuario(valores))
            //se der true envia para a página de login
            window.location.href = "login.html"

    }
        
})

//função que cadastra o usuario 
async function cadastraUsuario(valores){

    try{
        //faz a requisição para o backend
        const response = await fetch(url,{
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(valores)
        })

        //verifica se a requisição foi bem sucedida
        if(!response.ok){
            alert(response.message);
            return false;
        }

    }catch(error){
        Console.Log(`Ocorreu um erro ${error}:`)
        alert('Ocorreu um erro, por favor tente de novo')
        return false
    }
    return true
}

//função que procura um dado no backend
async function procuraDado(nome, dado){

    //faz a requisição para o backend
    const response =  await fetch(url+ '/' +nome , {
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