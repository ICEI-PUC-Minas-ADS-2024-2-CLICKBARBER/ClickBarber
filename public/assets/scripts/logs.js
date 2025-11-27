const url = 'http://localhost:3000' //url básica da requisição
//pega os componentes que serão usados
const form = document.getElementById('input_log')
const btn_p = document.getElementById('btn_pesq')
const filtro_t = document.getElementById('filtro_tipo')
const filtro_i = document.getElementById('filtro_item')
const filtro_d = document.getElementById('filtro_data')
const result = document.getElementById('result')
const index = document.getElementById('index')
//contador usado pra identificar em qual página o usuário esta
let pag =1
//usado pra gardar os logs vindos da requisição
let dados
//contador usado pra saber a quantidade máxima de páginas
let nPag


//função que muda o cabeçalho
window.addEventListener('DOMContentLoaded', async function() {

    //verifica se o usuário esta autorizado a acessar os logs
    if(!sessionStorage.getItem('tl')){
        //se não estiver redireciona pra página de verificação
        window.location.href = "acessaLogs.html"
    }
})
//quando clicar no botão de sair retira o token contendo o cnpj do sessionStorage e envia o usuário pra página acessaLogs
document.getElementById('btnSair').addEventListener('click' , ()=>{
    sessionStorage.removeItem('tl')
    window.location.href = 'acessaLogs.html'
})

//quando clicar no botão de pesquisa
btn_p.addEventListener('click', async (event) =>{

    const item = form.value.trim() //pega o valor do input
    dados = '' //reseta a variavel que guarda os logs

    //verifica se o input esta vazio
    if(!item)
        event.preventDefault()

    else{
        //pega os valores do filtro (tipo , item , data)
        const ft = filtro_t.value
        const fi = filtro_i.value
        const fd = filtro_d.value

        //faz a requisição enviando os filtros como query e token com o cnpj da barbearia
        const response = await fetch(url+'/logs/'+item+'?filtros='+ft+'+'+fi+'+'+fd , {
            method: 'GET',
            headers: {
                authorization: 'Bearer '+sessionStorage.getItem('tl')
            }
        })
        
        //se a requisição for bem sucedida a var dados guarda todos os logs ja filtrados
        if(response.ok){
            dados = await response.json()
            dados = dados.logs
        }
        
        //verifica se existem logs
        if(dados.length >0){
            //descobre o numero de páginas (5 logs por página)
            nPag = dados.length/5
            //chama a função que formata a data (do bd ela vem no formato ISO com tres horas de atraso)
            formataData(dados)
        }

        //chama a função que faz a tabela contendo os logs
        fazTabela()
    }
})

function fazTabela(){
    //variavel usada pra criar o body da table
    let valores = '';
    //reseta o interior das divs
    result.innerHTML = '';
    index.innerHTML = '';
    
    //verifica se existem logs em dados
    if(dados === null || !dados || dados.length <=0){
        result.innerHTML = `
        <div>
            <h1>Nenhum log encontrado</h1>
        </div>
        `
    }
    else{
        //pega a quantidade total de logs
        quant = dados.length
        

        //verifica se é necessario apenas uma página de logs
        if(quant<=5){
            //pega cada um dos dados
            dados.forEach(dado =>{
                let metodo //usado pra guardar o metodo em portugues
                let classe //usado ora guardar a classe(CSS) baseado no tipo de método
                let frase  //usada pra frase que vem antes do item. EX : Produto [nome do item]

                //verifica se o metodo do log é CREATE
                if(dado.metodo == 'create'){
                    metodo = 'Criação'
                    classe = 'crt'
                }
                //verifica se o metodo do log é DELETE
                else if(dado.metodo == 'delete'){
                    metodo = 'Exclusão'
                    classe = 'exc'
                }
                //se não for delete nem create é update
                else{
                    metodo = 'Edição'
                    classe = 'edt'
                }

                //determina a frase usada baseado no tipo do item
                if(dado.tipo_item == 'agenda')
                    frase = 'Agendamento com Cliente'
                else if(dado.tipo_item == 'servico')
                    frase = 'Serviço'
                else if(dado.tipo_item == 'produto')
                    frase = 'Produto'
                else
                    frase = 'Atendimento #'
                
                //adiciona sem resetar a linha contendo os valores desse log na variavel valores
                valores+=`
                    <tr>
                        <td><span class="${classe}">${metodo}</span></td>
                        <td class="t">${frase} ${dado.item}</td>
                        <td>${dado.usuario}</td>
                        <td>${dado.data_hora}</td>
                    </tr>
                `
            })
            //cria a tabela após o fim do foreach
            result.innerHTML = `
                <table id="table">
                    <thead>
                        <tr>
                            <th class="tipo">AÇÃO</th>
                            <th class="item">ITEM AFETADO</th>
                            <th class="user">USUÁRIO</th>
                            <th class="data">DATA E HORA</th>
                        </tr>
                    </thead>
                    <tbody id='tbody'>
                        ${valores} 
                    </tbody>
                </table>
            `
            //cria o index contendo a quantidade total de páginas e o primeiro e ultimo item da página atual
            index.innerHTML = `
                <div id="quant">
                    Mostrando <strong>${quant-(quant-1)} - ${quant}</strong> de <strong>${quant}</strong>
                </div>
                <div id="control">
                    <button>Anterior</button>
                    <button>...</button>
                    <button>Próximo</button>
                </div>
            `
        }
        //se tiver mais de uma página de logs (mais de 5 logs)
        else{

            //faz um for que so vai ser realizado no máximo 5 vezes e vai começar e terminar baseado no numero do log e na quantidade 
            //que tiver em uma determinada página
            for(let i = (5*(pag-1)) ; i<5*pag ; i++){
                //verifica se o i é maior que a quantidade de logs (usado pra quando uma página tem menos que 5 logs)
                if(i<dados.length){
                    let metodo //usado pra guardar o metodo em portugues
                    let classe //usado ora guardar a classe(CSS) baseado no tipo de método
                    let frase  //usada pra frase que vem antes do item. EX : Produto [nome do item]

                    //verifica se o metodo do log é CREATE
                    if(dados[i].metodo == 'create'){
                        metodo = 'Criação'
                        classe = 'crt'
                    }
                    //verifica se o metodo do log é DELETE
                    else if(dados[i].metodo == 'delete'){
                        metodo = 'Exclusão'
                        classe = 'exc'
                    } 
                    //se não for nem create nem delete é update
                    else{
                        metodo = 'Edição'
                        classe = 'edt'
                    }

                    //determina a frase usada baseado no tipo do item
                    if(dados[i].tipo_item == 'agenda')
                        frase = 'Agendamento com Cliente'
                    else if(dados[i].tipo_item == 'servico')
                        frase = 'Serviço'
                    else if(dados[i].tipo_item == 'produto')
                        frase = 'Produto'
                    else
                        frase = 'Atendimento #'

                    //adiciona sem resetar a linha contendo os valores desse log na variavel valores
                    valores+=`
                        <tr>
                            <td><span class="${classe}">${metodo}</span></td>
                            <td class="t">${frase} ${dados[i].item}</td>
                            <td>${dados[i].usuario}</td>
                            <td>${dados[i].data_hora}</td>
                        </tr>
                    `
                }
            }
            //cria a tabela após o fim do for
            result.innerHTML = `
                <table id="table">
                    <thead>
                        <tr>
                            <th class="tipo">AÇÃO</th>
                            <th class="item">ITEM AFETADO</th>
                            <th class="user">USUÁRIO</th>
                            <th class="data">DATA E HORA</th>
                        </tr>
                    </thead>
                    <tbody id='tbody'>
                        ${valores}
                    </tbody>
                </table>
            `
            
            //pega a quantidade total de logs (so usado pra ultima página)
            let maxPag = dados.length
            //verifica se o usuário esta na ultima página
            if(nPag>pag){
                maxPag = 5*pag //se não estiver pega a maior posição presente naquela página
            }
            //cria o a div index contendo a posição minima e maxima dos logs naquela determinada página 
            //junto com a quantidade total de logs
            index.innerHTML = `
                <div id="quant">
                    Mostrando <strong>${5*(pag-1)+1} - ${maxPag}</strong> de <strong>${quant}</strong>
                </div>
                <div id="control">
                    <button id="ant">Anterior</button>
                    <button>...</button>
                    <button id="prox">Próximo</button>
                </div>
            `
        }
    }   
}
//função usada pra ir pra página de logs anterior
document.addEventListener('click', (event) =>{
    //como o index é criado dinamicamente não da pra pegar o valor dele com document.getElementById
    //então essa função será acionada quando qualquer botão for clicado 
    //mas so ira fazer algo quando o id desse botão for 'ant
    if(event.target.id == 'ant'){
        //verifica se o usuário esta na primeira página (impede que pag tenha valor menor que 1)
        if(pag>1){
            pag--; //diminui o identificador da página
            fazTabela() //chama a função que cria a tabela (dessa vez será criada com outra página)
        }
    }
})
//funciona do mesmo jeito que a função a cima so que essa avança para a p´roxima página em vexz de voltar
document.addEventListener('click', (event) =>{
    if(event.target.id == 'prox'){
        //verifica se esta na ultima página (impede que a pag tenha valor maior que a quantidade total de páginas)
        if(pag<nPag){
            pag++;
            fazTabela()
        }
    }
})

//função usada pra formatar a data
function formataData(dadosData){
    //pega um log por vez
    dadosData.forEach(dadoData =>{
        //tira do formato iso
        let newData = new Date(dadoData.data_hora.replace(' ' , 'T').replace('.000Z' , ''))
        //diminui a quantidade de horas por 3 (ela estava atrasada 3 horas)
        newData = new Date(newData.getTime() - (3 * 60 * 60 * 1000))
        //pega o log e muda o valor da data pra nova
        dadoData.data_hora = newData.toLocaleString('pt-BR').replace(',', ' ').replaceAll('/' , '-')
        
    })
}




