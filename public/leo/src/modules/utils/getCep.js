//função que pega as informações a partir do cep
export async function pegaDadosCep(cep){
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

    if(!response.ok )
        return null

    let data = await response.json();

    //verifica se o cep é válido
    if(data.erro)
        return null

    //pega a cidade, bairro e rua
    data = {
        rua : data.logradouro ,
        bairro : data.bairro ,
        cidade : data.localidade
    }
    return data ;
}