import { readFile, writeFile } from 'fs/promises'; /*usa fs/promises -API de arquivos do Node para usar com async/await- para ler/gravar assíncrono em arquivo*/
import path from 'path';
import { loadEnv } from '../../../config/env.js';

const { DATA_FILE } = loadEnv(); /*lê do .env o DATA_FILE (ex.: ./db/db.json)*/
const dataFile = path.resolve(process.cwd(), DATA_FILE); /*gera o caminho absoluto do arquivo de dados*/

/*funções internas*/
async function readAll() {
  try { /*lê o JSON do disco e devolve um array*/
    const txt = await readFile(dataFile, 'utf-8');
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch { /*se não existir ou der erro (de interpretação/conversão de texto), devolve [] (não quebra a API)*/
    return [];
  }
}
async function writeAll(list) { /*salva toda a lista no arquivo (com identação)*/
  await writeFile(dataFile, JSON.stringify(list, null, 2), 'utf-8');
}

const produtoRepositoryFile = { /*repositório (CRUD e consultas)*/

  async list({ search, categoria, ativo, descartavel }) {
    const all = await readAll(); /*começa com todos os produtos e depois aplica os filtros:*/
    let out = all;

    if (search) { /*torna tudo minúsculo e procura ocorrência parcial em nome, categoria, marca*/
      const s = String(search).toLowerCase();
      out = out.filter(p =>
        [p.nome, p.categoria, p.marca]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(s))
      );
    }
    if (categoria) { /*compara exatamente o valor da categoria do produto com a categoria enviada na URL*/
      out = out.filter(
        p => String(p.categoria).toLowerCase() === String(categoria).toLowerCase()
      );
    }
    if (ativo !== undefined) { /*converte string pra boolean ('true' = true) e filtra p.ativo === bool*/
      const bool = String(ativo) === 'true';
      out = out.filter(p => Boolean(p.ativo) === bool);
    }
    if (descartavel !== undefined) { /*aceita 'true' || '1' || 'sim' || 's' como true; o resto é false*/
      const v = String(descartavel).toLowerCase();
      const bool = (v === 'true' || v === '1' || v === 'sim' || v === 's');
      out = out.filter(p => Boolean(p.descartavel) === bool);
    }
    return out; /*devolve um array de produtos já filtrado pelos parâmetros (search, categoria, ativo, descartavel)*/
  },

  async findById(id) { /*procura um item cujo id coincida (comparação em string)*/
    const all = await readAll();
    return all.find(p => String(p.id) === String(id)) || null;
  },

  async create(produto) { /*gera novo id como maiorId + 1, adiciona e persiste*/
    const all = await readAll();
    const maxId = all.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
    const novo = { ...produto, id: maxId + 1 };
    all.push(novo);
    await writeAll(all);
    return novo;
  },

  async update(id, data) { /*atualiza em memória e grava a lista "nova" toda*/
    const all = await readAll();
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null; /*se não encontrar, null (o service transforma em 404)*/
    all[idx] = { ...all[idx], ...data, id: all[idx].id };
    await writeAll(all);
    return all[idx];
  },

  async delete(id) { /*remove pelo índice e persiste*/
    const all = await readAll();
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return false;
    all.splice(idx, 1);
    await writeAll(all);
    return true; /*retorna true para indicar sucesso*/
  },

  async categorias() { /*coleta categoria de todos, remove vazios, tira categorias duplicadas com Set e ordena*/
    const all = await readAll();
    const set = new Set(all.map(p => (p.categoria || '').trim()).filter(Boolean));
    return Array.from(set).sort();
  }
};

export default produtoRepositoryFile; /*entrega esse “adaptador de dados” para o service usar*/

/*resumo: camada de acesso a dados baseada em arquivo JSON: lê tudo, filtra, encontra por id, cria com id sequencial, atualiza/ remove e retorna categorias únicas*/
/*obs: async/await é uma forma mais simples de lidar com operações assíncronas em js (coisas que demoram: ler arquivo, acessar banco, chamar API)*/