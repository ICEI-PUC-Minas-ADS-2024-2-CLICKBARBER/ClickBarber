const url = 'http://localhost:3000/usuarios'
const btnEntrar = document.getElementById("btnEntrar");

btnEntrar.addEventListener('click',async (event)=>{

    //some com os avisos
    document.querySelectorAll(".invalid").forEach(element =>{
        element.style.display = "none"
    })

    //pega os valores de cada campo
    const email = document.getElementById("email").value.trim();

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
    else
        if(await verificaEmail(email)){
            valid = false;
            document.getElementById("inEmail").style.display="flex";
        }


    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
})

async function verificaEmail(email){

    const response =  await fetch(url+ '?email=' +email)

    if(!response.ok){
        throw new Error('Ocorreu um erro')
    }

    const data = await response.json()

    return data.length == 0
    
}