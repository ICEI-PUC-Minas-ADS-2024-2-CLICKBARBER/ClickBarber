import {pool} from '../server.js';

//função que pega todos os agendamentos do banco de dados
export async function pegaAgendamentos(){
    const [rows] = await pool.execute('select * from Agenda');
    return rows;
}
//função que pega apenas 1 agendamento do banco de dados
export async function pegaAgendamento(id){
    const [rows] = await pool.execute('select * from Agenda where ID_agenda = ?', [id])
    return rows[0];
}

//função que cadastra um agendamento no banco de dados
export async function criaAgendamento(novo){
    const {barbeiro, cliente, servico, horario, data} = novo;

    //pega o resultado da query de insert
    const [result] = await pool.execute('insert into Agenda (ID_servico, ID_pessoa, Data, Horario_inicio, Horario_Fim) values (?, ?, ?, ?, ?)',
    [barbeiro, cliente, servico, horario_inicio, Horario_fim, data]);

    //verifica se alguma linha foi alterada (nesse caso, criada)
    return result.affectedRows >0;
}

//função que altera a data e o horário de um agendamento no banco de dados
export async function alteraAgendamento(id, data, horario){
    //pega o resultado da query de update
    const [result] = await pool.execute('update Agenda set Data = ?, Horário = ? where ID_agenda = ?', [data, horario, id]);

    //verifica se alguma linha foi alterada (nesse caso, atualizada)
    return result.affectedRows >0;
}

//função que exclui um agendamento no banco de dados
export async function excluiAgendamento(id){
    //pega o resultado da query de delete
    const [result] = await pool.execute('delete from Agenda where ID_agenda = ?',[id]);

    //verifica se alguma linha foi alterada (nesse caso, excluída)
    return result.affectedRows >0;
}

//função que verifica se um dado existe no banco de dados
export async function verificaDado(id , tabela, coluna){
    const [rows] = await pool.execute(`select * from ${tabela} where ${coluna} = ?,[id]`);
    return rows.length >0;
}

//função que pega todos os barbeiro cadastrados no banco de dados
export async function pegaBarbeiros(){
    const [rows] = await pool.execute('select * from Pessoa where tipo_usuario = "funcionario"')

    return rows;
}
//função que pega todos os serviços cadastrados no banco de dados
export async function pegaServicos(){
    const [rows] = await pool.execute('select * from Servico')

    return rows;
}