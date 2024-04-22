chrome.contextMenus.create({
  id: "searchTJMG",
  title: "Consultar no TJMG",
  contexts: ["selection"]
});

chrome.contextMenus.create({
  id: "searchMPMG",
  title: "Consultar no MPMG",
  contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  var processNumber = info.selectionText.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
  if (processNumber !== "") {
    if (info.menuItemId === "searchTJMG") {
      chrome.tabs.create({ 
        url: "https://www4.tjmg.jus.br/juridico/sf/proc_complemento2.jsp?listaProcessos=" + processNumber 
      });
    } else if (info.menuItemId === "searchMPMG") {
      chrome.tabs.create({
        url: "https://aplicacao.mpmg.mp.br/pareceres/processoParecerPesquisar.do?numProcessoCorrente=0" + processNumber
      });
    }
  } else {
    alert("Por favor, selecione um número de processo na página antes de clicar no botão.");
  }
});
