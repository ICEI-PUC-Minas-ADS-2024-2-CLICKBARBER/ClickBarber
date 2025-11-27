import mysql from 'mysql2/promise'
//importa a pool do banco de dados
import { pool } from '../../index.js';

const bd = mysql.createPool({
    host: '127.0.0.1',     
    port: 3306,            
    user: 'leoM',          
    password: 'Escanor489.',       
    database: 'db_barbershop'
})

//middleware usado pra registrar um log apos a ação ter sido feita 
//(chamada pelo next() de middlewares que criam, atualizam e excluem certos itens (produtos, agenda, atendimento e serviços))
export async function registraLog(req, res){
    try{
        //pega o metodo da rota em que o middlewar anterior esta (POST, PUT, PATCH e DELETE)
        let metodo = req.method; 
        //pega o tipo do valor (agenda, produto, atendimento ou serviço)         
        const tipo = req.dado.tipo 
        //pega o valor do item
        const valor = req.dado.valor
        //pega o cnpj da barbearia na qual esse item pertence
        const cnpj = req.dad.cnpj

        /*
          os valores acima (tipo, valor e cnpj) devem ser informados no middleware anterior desse jeito :
          req.dado = {
            tipo: 'tipo do item',
            valor: valor_do_item ,
            cnpj: cnpj_da_barbearia
          }  
        */ 

        //determina o tipo do metodo que sera colocado no banco de dados
        if(metodo = 'POST')
            metodo = 'create'
        else if(metodo = 'DELETE')
            metodo = 'delete'
        if(metodo = 'PATCH' || metodo == 'PUT')
            metodo = 'update'

        //adiciona o log no banco de dados com o metodo, o tipo do item, o valor do item o usuário(por enquanto é fixo) e o cnpj da barbearia
        await pool.execute('insert into logs (metodo , tipo_item , item , usuario , CNPJ_barbearia) values(?,?,?,?,?)',[metodo , tipo ,valor , 'admin@gmail.com' , cnpj])

    }catch(error){
        return res.status(500).send({message: 'Erro interno do servidor'})
    }
}

//middleware que pega todos os logs relacionado a uma barbearia e filtra eles
export async function pegaLogs(req , res){
    //pega o nome do item enviado como parametro na url
    const valor = req.params.valor
    //pega os 3 filtros (metodo, tipo_item e data) enviador como query
    const filtro = req.query.filtros.split(' ');
    //pega o cnpj da barbearia
    const {cnpj} = req.dados
    let tipo = null
    
    //verifica se o nome do item é válido e se existem no minimo e no maximo 3 filtros
    if(!valor || !filtro || filtro.length!=3)
        return res.status(400).send({message: 'Item ou filtros incorretos'})

    //verifica se o item é um método
    if(valor == 'update' || valor == 'delete' || valor == 'create')
        tipo = 'metodo'   
    //verifica se o item é um email do usuário
    else if(valor.includes('@'))
        tipo = 'usuario'
    //se não for um método nem um usuário é do tipo item(agenda , produto, atendimento ou serviço)
    else
        tipo = 'item'

    try{
        //pega todos os logs cujo valor e cnpj é igual aos enviados
        let [rows] = await pool.execute(`select * from logs where ${tipo} = ? and CNPJ_barbearia = ?`,[valor , cnpj])

        ////verifica se existem logs
        if(rows.length <=0)
            return res.status(404).send({message: 'Log não encontrado'})

        //começa as filtragens

        //filtra pelo metodo (create, delete e update)
        if(filtro[0] != 'tudo'){
            rows = rows.filter(row=> row.metodo == filtro[0])
        }
        //filtra pelo tipo do item (agenda, serviço , atendimento ou produto)
        if(filtro[1] != 'tudo' && rows.length >0){
            rows = rows.filter(row=> row.tipo_item == filtro[1])
        }
        //filtra pela data (hoje, mes e ano)
        if(filtro[2] != 'tudo' && rows.length >0){

            //pega e formata a data de hoje de acordo com a que esta no banco de dados (no bd esta 3 horas adiantada)
            let data = new Date()
            data = new Date(data.getTime() + (3 * 60 * 60 * 1000))
            data = data.toString().split(' ').slice(1 , 4).join(' ') 

            //verifica se o filtro pede os logs criados hoje
            if(filtro[2] == 'hoje'){
                rows = rows.filter(row =>{
                    //pega a data do bd e transforma pra ficar no msm formato da data de hoje
                    let dia = row.data_hora.toString().split(' ').slice(1, 4).join(' ') 
                    return dia == data; //se forem iguais essa posição não é retirada do array
                })
            }
            //verifica se o filtro pede os logs criados nesse mes
            else if(filtro[2] == 'mes'){
                data = data.split(' ')[0] + ' ' +  data.split(' ')[2] //pega so o mes e o ano da data de hoje e junta os dois
                rows = rows.filter(row =>{
                    //pega a data do bd e transforma pra ficar no msm formato da data de hoje 
                    let mes = row.data_hora.toString().split(' ').slice(1,4).join(' ') 
                    mes = mes.split(' ')[0] + ' ' +  mes.split(' ')[2] //pega so o mes e o ano
                    return mes == data; //se forem iguais essa posição não é retirada do array
                })
            }
            //se não for nem hoje nem nesse mes é porque esta pedindo os logs criados nessa ano
            else{
                data = data.split(' ')[2] //pega so o ano da data de hoje
                rows = rows.filter(row =>{
                    //pega a data do bd e transforma pra ficar no msm formato da data de hoje dessa vez pegando so o ano
                    let ano = row.data_hora.toString().split(' ')[3]
                    return ano == data; //se forem iguais essa posição não é retirada do array
                })
            }
        }

        //verifica se após a filtragem ainda existe algum log
        if(rows.length <= 0)
            return res.status(404).send({message:'Logs não encontrados'})

        return res.status(200).send({message: 'Log encontrado', logs: rows})

    }catch(error){
        return res.status(500).send({message: 'Erro interno do servidor'+error})
    }
}
