const url = 'http://localhost:3000/usuarios'
const btnCriar =  document.getElementById("btnCria");
const check = document.getElementById("check");
const check2 = document.getElementById("check2");

//copiei do leo, to testando aos pouco e arrumando pro meu, reutilizando o dele pra já ser mais rapido e também ter um padrão de cadastro
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

    if(check.checked){
        img.src = "assets/img/olhon.png"
        senha.type = "text"
    }
    else{
        img.src = "assets/img/olho.png"
        senha.type = "password"
    }

})

check2.addEventListener('click',()=>{
    const img = document.getElementById("imgCheckBox2");
    const senha = document.getElementById("senhaConfirm");

    if(check2.checked){
        img.src = "assets/img/olhon.png"
        senha.type = "text"
    }
    else{
        img.src = "assets/img/olho.png"
        senha.type = "password"
    }
})


//função que verifica se todos os campos estão preenchidos de forma correta
btnCriar.addEventListener('click', async (event) => {
    
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

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
    else if(await procuraDado('email',email)){ // <-- json-server
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
    else if(await procuraDado('cpf',cpf)){ // <-- json-server
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

        else if(senha!==senha2){
            valid = false;
            document.getElementById("inSenha2").style.display="flex";
        }
    }

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

        if(await cadastraUsuario(valores))
            window.location.href = "login.html"
    }
        
})

//função que cadastra o usuario  (json-server pronto)
async function cadastraUsuario(valores){

    try{
        const response = await fetch(url,{
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(valores)
        })

        if(!response.ok){
            alert("Erro ao cadastrar!");
            return false;
        }

    }catch(error){
        console.log(`Ocorreu um erro ${error}:`)
        alert('Ocorreu um erro, por favor tente de novo')
        return false
    }
    return true
}


//função que procura um dado no backend  (ADAPTADO para json-server)
async function procuraDado(nome, dado){

    // json-server: GET /usuarios?email=valor
    const response =  await fetch(`${url}?${nome}=${dado}`)

    if(!response.ok){
        alert("Erro ao verificar " + nome)
        return false
    }

    const data = await response.json()

    // retorno true se achou algo
    return data.length > 0
}


//função que verifica se existe uma conta logada (json-server NÃO SUPORTA TOKEN)
// → então deixo sempre como "sem login ativo"
async function verificaLogin(token , l){
    return true; 
}
