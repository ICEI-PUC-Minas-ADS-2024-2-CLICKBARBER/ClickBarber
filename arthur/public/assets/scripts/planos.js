// Função para verificar se existe dados no localStorage
function verificarLocalStorage() {
  // Verifica se existe alguma chave no localStorage
  if (localStorage.length === 0) {
    console.log('LocalStorage está vazio');
    return false;
  }

  // Procura por dados que contenham as propriedades mencionadas
  let encontrado = false;

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    const valor = localStorage.getItem(chave);
    
    try {
      const dados = JSON.parse(valor);
      
      // Verifica se o objeto tem as propriedades id, name, email, horario, ID, name
      if (dados && typeof dados === 'object') {
        if (dados.id || dados.name || dados.email || dados.horario || dados.ID || dados.nome) {
          console.log(`Encontrado em "${chave}":`, dados);
          encontrado = true;
        }
      }
    } catch (e) {
      // Se não for JSON válido, ignora
      continue;
    }
  }

  if (!encontrado) {
    console.log('Nenhum dado com essas propriedades foi encontrado no localStorage');
  }

  return encontrado;
}

// Executar a verificação
verificarLocalStorage();

// Ou se quiser verificar uma chave específica:
function verificarChaveEspecifica(nomeChave) {
  const dados = localStorage.getItem(nomeChave);
  
  if (!dados) {
    console.log(`Chave "${nomeChave}" não encontrada no localStorage`);
    return null;
  }

  try {
    const dadosParseados = JSON.parse(dados);
    console.log(`Dados encontrados em "${nomeChave}":`, dadosParseados);
    document.getElementsByClassName('enter')[0].style.display = "none";
    return dadosParseados;
  } catch (e) {
    console.log(`Dados em "${nomeChave}" não são JSON válido:`, dados);
    return dados;
  }
}

// Exemplo de uso:
// verificarChaveEspecifica('usuario');
// verificarChaveEspecifica('agendamento');