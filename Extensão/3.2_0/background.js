// Criação dos itens de menu
chrome.contextMenus.create({
  id: "searchTJMG",
  title: "Consultar no TJMG",
  contexts: ["selection"]
});

// Criação do item de menu Consultar no MPMG
chrome.contextMenus.create({
  id: "searchMPMG",
  title: "MPMG",
  contexts: ["selection"]
});

// Criação do submenu Consulta MPMG
chrome.contextMenus.create({
  id: "consultaMPMG",
  parentId: "searchMPMG", // Define que este submenu pertence ao "Consultar no MPMG"
  title: "Consulta MPMG",
  contexts: ["selection"]
});

// Criação do submenu Gestão MPMG
chrome.contextMenus.create({
  id: "gestaoMPMG",
  parentId: "searchMPMG", // Define que este submenu pertence ao "Consultar no MPMG"
  title: "Gestão MPMG",
  contexts: ["selection"]
});

// Função para copiar texto para a área de transferência
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    console.log("Número de processo copiado para a área de transferência: ", text);
  }, function(err) {
    console.error("Erro ao copiar para a área de transferência: ", err);
  });
}

// Listener de clique
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  var originalSelection = info.selectionText; // Mantém a seleção original com pontuações

  if (originalSelection !== "") {
    // Copia o número de processo original para a área de transferência
    copyToClipboard(originalSelection);

    // Remove caracteres não numéricos para formatar o número de processo
    var processNumber = originalSelection.replace(/[^\d]/g, '');

    if (processNumber !== "") {
      if (info.menuItemId === "searchTJMG") {
        // Abre a página de consulta do TJMG
        chrome.tabs.create({ 
          url: "https://www4.tjmg.jus.br/juridico/sf/proc_resultado2.jsp?listaProcessos=" + processNumber 
        });
      } else if (info.menuItemId === "consultaMPMG") {
        // Abre a página de consulta do MPMG imediatamente
        chrome.tabs.create({
          url: "https://aplicacao.mpmg.mp.br/scpj/f/t/gedoc/manterprocesso2sel?fwPlc=manterprocesso2man",
          active: true
        }, function(tab) {
          // Adiciona um listener para quando a aba estiver totalmente carregada
          chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
            if (updatedTabId === tab.id && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener); // Remove o listener após a primeira execução
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: fillProcessNumber,
                args: [processNumber]
              });
            }
          });
        });
      } else if (info.menuItemId === "gestaoMPMG") {
        // Abre a página de Gestão MPMG com o número do processo formatado
        var formattedProcessNumber = "0" + processNumber;
        chrome.tabs.create({ 
          url: "https://aplicacao.mpmg.mp.br/pareceres/processoParecerPesquisar.do?numProcessoCorrente=" + formattedProcessNumber
        });
      }
    }
  } else {
    alert("Por favor, selecione um número de processo na página antes de clicar no botão.");
  }
});

// Função para preencher o número do processo na página do MPMG
function fillProcessNumber(processNumber) {
  // Selecionando o campo de entrada do número do processo
  const inputField = document.querySelector('#corpo\\:formulario\\:numProcesso');

  if (inputField) {
    inputField.value = processNumber;

    // Selecionando o botão de ação pelo ID e clicando
    const submitButton = document.querySelector('#corpo\\:formulario\\:botaoAcaoPesquisar');
    if (submitButton) {
      submitButton.click(); // Clica no botão para pesquisar
    } else {
      console.error("Botão de pesquisa não encontrado.");
    }
  } else {
    console.error("Campo de entrada de processo não encontrado.");
  }
}
