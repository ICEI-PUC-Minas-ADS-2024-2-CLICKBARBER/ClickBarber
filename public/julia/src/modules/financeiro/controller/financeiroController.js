import PDFDocument from 'pdfkit'; /*importando biblioteca para gerar PDF*/
import financeiroService from '../service/financeiroService.js'; /*importa o service financeiro (onde estão as funções listarPorDia, listarPorBarbeiro, listarPorServico, gerarCsv)*/
import { schemaFinanceiro, exportacaoSchema } from '../schema/financeiroSchema.js'; /*importa os dois schemas (schemaFinanceiro para validar filtros das listagens - JSON - e exportacaoSchema para validar filtros da exportação (CSV/PDF)*/

/*função genérica para validar com Joi*/
function validar(schema, valores) { /*recebe schema joi e os valores*/
    const { error, value } = schema.validate(valores, { /*usa o joi para validar os valores*/
        abortEarly: false, /*não para no primeiro erro, junta todos*/
        convert: true /*tenta converter tipos*/
    });

    if (error) { /*se tiver erro*/
        const detalhes = error.details.map(d => d.message); /*extrai só as mensagens dos erros*/
        const err = new Error('Erro de validação'); /*cria um erro padrão*/
        err.status = 400; /*define que é erro de requisição*/
        err.detalhes = detalhes; /*guarda as mensagens de erro dentro da propriedade "detalhes"*/
        throw err; /*lança o erro pra ser tratado no catch lá embaixo*/
    }

    return value; /*se não deu erro, retorna value, que é a versão já validada e convertida dos dados*/
}

/*listagens (JSON):*/
/*endpoint e os parâmetros esperados: GET /api/financeiro/por-dia?inicio=YYYY-MM-DD&fim=YYYY-MM-DD&barbeiroId=&servicoId=*/
async function listarPorDia(req, res) { /*função assíncrona do controller (middleware do Express - função que o Express executa no meio do fluxo da requisição para tratar algo (log, validação...)*/
    try {
        const filtros = validar(schemaFinanceiro, req.query); /*valida req.query (query string) usando schemaFinanceiro*/

        /*chama o service:*/
        const dados = await financeiroService.listarPorDia({ /*consulta no banco e passa os filtros abaixo já validados:*/
            inicio: filtros.inicio,
            fim: filtros.fim,
            /*barbeiroId: filtros.barbeiroId,
            servicoId: filtros.servicoId*/
        });
        res.json(dados); /*responde para o usuário com JSON (lista de registros por dia)*/
    }
    catch (err) {
        console.error('Erro em listarPorDia:', err);
        res
            .status(err.status || 500) /*se tiver err.status, usa; senão, 500*/
            .json({ /*responde com um JSON contendo:*/
                erro: err.message || 'Erro ao buscar dados financeiros por dia',
                detalhes: err.detalhes
            });
    }
}

/*endpoint e os parâmetros esperados: GET /api/financeiro/por-barbeiro*/
async function listarPorBarbeiro(req, res) { /*MESMA lógica de listarPorDia*/
    try {
        const filtros = validar(schemaFinanceiro, req.query);

        const dados = await financeiroService.listarPorBarbeiro({
            inicio: filtros.inicio,
            fim: filtros.fim,
            barbeiroId: filtros.barbeiroId,
            /*servicoId: filtros.servicoId*/
        });

        res.json(dados);
    }
    catch (err) {
        console.error('Erro em listarPorBarbeiro:', err);
        res
            .status(err.status || 500)
            .json({
                erro: err.message || 'Erro ao buscar dados financeiros por barbeiro',
                detalhes: err.detalhes
            });
    }
}

/*endpoint e os parâmetros esperados: GET /api/financeiro/por-servico*/
async function listarPorServico(req, res) { /*MESMA lógica de listarPorDia*/
    try {
        const filtros = validar(schemaFinanceiro, req.query);

        const dados = await financeiroService.listarPorServico({
            inicio: filtros.inicio,
            fim: filtros.fim,
            barbeiroId: filtros.barbeiroId,
            servicoId: filtros.servicoId
        });
        res.json(dados);

    } catch (err) {
        console.error('Erro em listarPorServico:', err);
        res
            .status(err.status || 500)
            .json({
                erro: err.message || 'Erro ao buscar dados financeiros por serviço',
                detalhes: err.detalhes
            });
    }
}

/*exportação CSV:*/
/*endpoint e os parâmetros esperados: GET /api/financeiro/exportar/csv?tipoTabela=dia|barbeiro|servico&inicio=&fim=&barbeiroId=&servicoId=*/
async function exportarCsv(req, res) {
    try {
        const filtros = validar(exportacaoSchema, { /*valida os filtros com exportacaoSchema:*/
            ...req.query,
            formato: 'csv'
        });

        const csv = await financeiroService.gerarCsv({ /*chama o service gerarCsv, passando os filtros já validados; csv é uma string com o conteúdo do arquivo CSV*/
            tipoTabela: filtros.tipoTabela,
            inicio: filtros.inicio,
            fim: filtros.fim,
            barbeiroId: filtros.barbeiroId,
            servicoId: filtros.servicoId
        });

        let nomeArquivo; /*nome do arquivo depois que baixar*/
        if (filtros.tipoTabela === 'dia') {
            nomeArquivo = 'por_período';
        } else if (filtros.tipoTabela === 'barbeiro') {
            nomeArquivo = 'por_barbeiro';
        } else if (filtros.tipoTabela === 'servico') {
            nomeArquivo = 'por_serviço';
        } else {
            nomeArquivo = 'financeiro.csv';
        }

        /*definindo os headers da resposta:*/
        res.setHeader('Content-Type', 'text/csv; charset=utf-8'); /*Content-Type diz que o conteúdo é CSV, em UTF-8*/
        res.setHeader(
            'Content-Disposition', /*Content-Disposition indica que é um anexo (download) e sugere o nome do arquivo:*/
            `attachment; filename=financeiro_tabela_${nomeArquivo}.csv`
        );
        res.send(csv); /*envia o conteúdo do CSV como corpo da resposta*/

    } catch (err) { /*se der erro, responde com JSON de erro*/
        console.error('Erro em exportarCsv:', err);
        res
            .status(err.status || 500)
            .json({
                erro: err.message || 'Erro ao exportar CSV',
                detalhes: err.detalhes
            });
    }
}

/*exportação PDF:*/
/*endpoint e os parâmetros esperados: GET /api/financeiro/exportar/pdf?tipoTabela=dia|barbeiro|servico&inicio=&fim=&barbeiroId=&servicoId=*/
async function exportarPdf(req, res) {
    try {
        const filtros = validar(exportacaoSchema, { /*MESMA lógica do CSV*/
            ...req.query,
            formato: 'pdf'
        });

        const { tipoTabela, inicio, fim, barbeiroId, servicoId } = filtros; /*cria variáveis a partir de "filtros"*/

        const labelTipoTabela = { /*nome que vai aparecer no pdf ao exportar*/
            dia: 'por período',
            barbeiro: 'por barbeiro',
            servico: 'por serviço'
        }[tipoTabela] || tipoTabela;

        let dados; /*guarda o resultado*/
        /*busca os dados conforme o tipo de tabela:*/
        if (tipoTabela === 'barbeiro') { /*se o tipo de tabela for barbeiro*/
            dados = await financeiroService.listarPorBarbeiro({ inicio, fim, barbeiroId /*servicoId*/ }); /*chama listarPorBarbeiro e guarda em "dados", que será um array de linhas com os campos esperados*/
        } else if (tipoTabela === 'servico') { /*MESMA lógica da tabela barbeiro*/
            dados = await financeiroService.listarPorServico({ inicio, fim, barbeiroId, servicoId });
        } else { /*MESMA lógica da tabela barbeiro*/
            dados = await financeiroService.listarPorDia({ inicio, fim /*barbeiroId, servicoId*/ });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 }); /*cria um novo documento PDF de tamanho A4 e margem de 50 pontos em volta*/

        /*configura os headers HTTP:*/
        res.setHeader('Content-Type', 'application/pdf'); /*Content-Type → PDF*/
        res.setHeader( /*Content-Disposition → download com nome financeiro_ + tipo da tabela.pdf*/
            'Content-Disposition',
            `attachment; filename=financeiro_tabela_${labelTipoTabela}.pdf`
        );

        doc.pipe(res); /*conecta o PDF gerado diretamente na resposta HTTP (res). Tudo que for escrito em doc vai saindo como resposta para o navegador*/

        /*cabeçalho do PDF:*/
        /*título:*/
        doc.fontSize(18).text('Relatório Financeiro - Click Barber', { align: 'center' });
        doc.moveDown(); /*pula uma linha - espaço vertical*/

        /*informações dos filtros:*/
        doc.fontSize(10).text(`Tipo de relatório: ${labelTipoTabela}`);
        const inicioStr = inicio ? String(inicio).slice(0, 10) : null;
        const fimStr = fim ? String(fim).slice(0, 10) : null;
        if (inicioStr && fimStr) {
            doc.text(`Período: ${inicioStr} até ${fimStr}`);
        }
        doc.moveDown();

        doc.fontSize(11); /*fonte do conteúdo das tabelas*/

        /*conteúdo conforme o tipo de tabela:*/
        if (tipoTabela === 'barbeiro') { /*se for tabela barbeiro*/
            doc.text('Barbeiro | Quantidade de atendimentos | Total faturado');
            doc.moveDown(0.5);
            if (!dados || dados.length === 0) { /*se a tabela não tiver linhas*/
                doc.text('Nenhum registro encontrado.');
            }
            else {
                dados.forEach(l => { /*para cada linha, escreve: nome do barbeiro, quantidade de atendimentos, total faturado:*/
                    doc.text(`${l.barbeiro} | ${l.quantidade_atendimentos} | R$ ${l.total_faturado}`);
                });
            }

        } else if (tipoTabela === 'servico') { /*MESMA lógica da tabela barbeiro*/
            doc.text('Serviço | Quantidade prestada de serviços | Total faturado');
            doc.moveDown(0.5);
            if (!dados || dados.length === 0) { /*se a tabela não tiver linhas*/
                doc.text('Nenhum registro encontrado.');
            }
            else {
                dados.forEach(l => {
                    doc.text(`${l.servico} | ${l.quantidade_servicos} | R$ ${l.total_faturado}`);
                });
            }

        } else { /*MESMA lógica da tabela barbeiro*/
            doc.text('Data | Quantidade de atendimentos | Total faturado');
            doc.moveDown(0.5);
            if (!dados || dados.length === 0) { /*se a tabela não tiver linhas*/
                doc.text('Nenhum registro encontrado.');
            }
            else {
                dados.forEach(l => {
                    doc.text(`${l.data} | ${l.quantidade_atendimentos} | R$ ${l.total_faturado}`);
                });
            }
        }
        doc.end(); /*finaliza o documento PDF: diz pro pdfkit que terminou de escrever, fecha o stream e encerra a resposta HTTP*/

    } catch (err) { /*caso dê erro*/
        console.error('Erro em exportarPdf:', err);
        res
            .status(err.status || 500)
            .json({
                erro: err.message || 'Erro ao exportar PDF',
                detalhes: err.detalhes
            });
    }
}

export default { /*exporta um objeto com todas as funções do controller para ser usado nas rotas*/
    listarPorDia,
    listarPorBarbeiro,
    listarPorServico,
    exportarCsv,
    exportarPdf
};

/*Joi = biblioteca de validação de dados para JavaScript/Node.js*/