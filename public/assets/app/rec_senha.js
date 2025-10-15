const btnEntrar = document.getElementById("btnEntrar");

btnEntrar.addEventListener('click',(event)=>{

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

    //se algum campo estiver invalido o envio não ira acontecer
    if(valid===false)
        event.preventDefault();
})