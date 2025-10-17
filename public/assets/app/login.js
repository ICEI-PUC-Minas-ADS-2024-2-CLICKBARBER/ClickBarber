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
        if(await procuraEmail(email)){
            valid = false;
            document.getElementById("inEmail").style.display="flex";
        }
        
        //verifica o campo senha
        else if(!senha || senha === ""){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }
        else if(!(await verificaSenha(email, senha))){
            valid = false;
            document.getElementById("inSenha").style.display="flex";
        }
    }

    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
    else{

        if(logaUser(email)){}
            //window.location.href = "cadastro_u.html"
    }

})

async function procuraEmail(dado){

    const response =  await fetch(url+ '/usuarios?email=' +dado)

    if(!response.ok){
        throw new Error('Ocorreu um erro')
    }

    const data = await response.json()

    console.log(data.length)

    return data.length == 0

}

async function verificaSenha(email,senha){

    const resp = await fetch(url+'/usuarios?email='+email)

    if(!resp.ok)
        throw new Error("Ocorreu um erro");

    const data = await resp.json();

    return data[0].senha == senha
}

async function logaUser(email) {
    
    const resp = await fetch(url+'/usuarios?email='+email)
    console.log(url+'/usuarios?email='+email)
    
    if(!resp.ok){
        throw Error('Ocorreu um erro')
    }

    const dados = await resp.json()
    console.log(dados[0])

    const valores = dados[0]

    const usuario = {
        id: valores.id,
        nome: valores.nome,
        email: valores.email,
        horario: new Date().toLocaleString('pt-BR')
    };
    console.log(usuario)
    
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
}