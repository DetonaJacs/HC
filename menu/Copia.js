document.addEventListener('DOMContentLoaded', function() {
    // Recuperar o nome do tema do localStorage
    var themeName = localStorage.getItem('selectedTheme');
    
    // Verificar se o tema está definido e se corresponde a um arquivo CSS existente
    if (themeName && themeName !== '') {
        var themeCSS = '../styles/' + themeName + '.css'; // Caminho para o arquivo CSS do tema
        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('href', themeCSS);
        document.head.appendChild(linkElement);
    }
});

var validNumbers = []; // Array para armazenar os números válidos

// Função para extrair números de processo
function extractNumbers() {
var processList = document.getElementById('processList').value;
var numbers = processList.match(/\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3}\b|\b\d{1}\.\d{4}\.\d{2}\.\d{6}-\d{1}\/\d{3}\b|\b\d{17}\b|\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}\.\d{1}\.\d{3}\b|\b\d{20}\b/g);
var resultUl = document.getElementById('result');
var duplicateList = document.getElementById('duplicateList');
resultUl.innerHTML = '';
duplicateList.innerHTML = '';
var count = 0;
var numberCounts = {};
var duplicateNumbers = [];
validNumbers = []; // Limpa o array antes de preencher novamente

if (numbers !== null) {
numbers.forEach(function(number) {
    var formattedNumber = formatNumber(number);
    if (numberCounts[formattedNumber]) {
        numberCounts[formattedNumber]++;
        if (numberCounts[formattedNumber] === 2) {
            duplicateNumbers.push({
                number: formattedNumber,
                count: 2 // Inicializa a contagem para duplicados
            });
        } else if (numberCounts[formattedNumber] > 2) {
            // Atualiza a contagem para números que já eram duplicados
            var existingDuplicate = duplicateNumbers.find(function(dup) {
                return dup.number === formattedNumber;
            });
            if (existingDuplicate) {
                existingDuplicate.count = numberCounts[formattedNumber];
            }
        }
    } else {
        numberCounts[formattedNumber] = 1;
    }
    validNumbers.push(formattedNumber);
});

validNumbers.forEach(function(number) {
    var li = document.createElement('li');
    li.textContent = number;

    // Botão TJMG
    var button1 = document.createElement('button');
    button1.textContent = 'TJMG';
    button1.className = 'btn';
    button1.onclick = function() {
        var processNumberWithoutPunctuation = number.replace(/[^\d]/g, '');
        window.open('https://www4.tjmg.jus.br/juridico/sf/proc_resultado2.jsp?listaProcessos=' + processNumberWithoutPunctuation);
    };
    li.appendChild(button1);

    // Botão MPMG
    var button2 = document.createElement('button');
    button2.textContent = 'MPMG';
    button2.className = 'btn';
    button2.onclick = function() {
        var processNumberWithoutPunctuation = number.replace(/[^\d]/g, '');
        window.open('https://aplicacao.mpmg.mp.br/pareceres/processoParecerPesquisar.do?numProcessoCorrente=0' + processNumberWithoutPunctuation);
    };
    li.appendChild(button2);

    // Botão para consultar na extensão
    var button3 = document.createElement('button');
    button3.textContent = 'Extensão';
    button3.className = 'btn';
    button3.onclick = function() {
        var processNumberWithoutPunctuation = number.replace(/[^\d]/g, '');
        consultarProcessoNaExtensao(processNumberWithoutPunctuation, "consultarProcessoMPMG"); // Altere para "consultarProcessoTJMG" se necessário
    };
    li.appendChild(button3);

    // Botão de exclusão
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'botaoexcluir';
    deleteButton.onclick = function() {
        li.remove();
        validNumbers = validNumbers.filter(function(n) {
            return n !== number;
        });
        updateCount();
        toggleButtons();
    };
    li.appendChild(deleteButton);

    resultUl.appendChild(li);
    count++;
});

// Exibe a lista de números duplicados
duplicateNumbers.forEach(function(dup) {
    var li = document.createElement('li');
    li.textContent = dup.number + ' (' + dup.count + ')';
    duplicateList.appendChild(li);
});

updateCount();

var duplicateMsg = document.getElementById('duplicateMsg');
if (duplicateNumbers.length > 0) {
    duplicateMsg.textContent = 'Números de processo duplicados:';
    duplicateMsg.style.color = 'red';
} else {
    duplicateMsg.textContent = 'Nenhum número de processo duplicado encontrado.';
    duplicateMsg.style.color = 'green';
}
} else {
var li = document.createElement('li');
li.textContent = 'Nenhum número de processo encontrado no formato adequado.';
resultUl.appendChild(li);
}

toggleButtons();
}

// Função para formatar o número de processo no formato x.xxxx.xx.xxx.xxx-x/xxx
function formatNumber(number) {
var digits = number.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
return digits.replace(/(\d{1})(\d{4})(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})/, '$1.$2.$3.$4.$5-$6/$7');
}

// Função para limpar o formulário
function resetForm() {
document.getElementById('processList').value = '';
document.getElementById('result').innerHTML = '';
document.getElementById('count').textContent = '';
document.getElementById('duplicateMsg').textContent = '';
document.getElementById('mensagemAlerta').textContent = '';
document.getElementById('duplicateList').innerHTML = ''; // Limpa a lista de duplicados
toggleButtons();
}

// Função para copiar números de processo
function copyNumbers() {
    var resultUl = document.getElementById('result');
    var items = Array.from(resultUl.children);

    // Extrair apenas os números formatados da lista ordenada
    var orderedNumbers = items.map(function(item) {
        return item.firstChild.textContent.trim(); // Pegando apenas o número do processo, ignorando os botões
    });

    // Adicionar o total de processos ao texto copiado
    var totalProcesses = orderedNumbers.length;
    var numbersText = "Total de processos: " + totalProcesses + "\n\n" + orderedNumbers.join('\n');

    // Copiar os números e o total de processos para a área de transferência
    navigator.clipboard.writeText(numbersText).then(function() {
        // Exibir a mensagem temporária
        showToast("Números copiados para a área de transferência!");
    }).catch(function(error) {
        // Lidar com qualquer erro que possa ocorrer durante a cópia
        console.error('Erro ao copiar para a área de transferência: ', error);
        showToast("Erro ao copiar para a área de transferência!", 5000); // Exibe uma mensagem de erro por 5 segundos
    });
}


// Função para abrir todos os links TJMG
function openAllTJMG() {
validNumbers.forEach(function(number) {
var processNumberWithoutPunctuation = number.replace(/[^\d]/g, '');
window.open('https://www4.tjmg.jus.br/juridico/sf/proc_resultado2.jsp?listaProcessos=' + processNumberWithoutPunctuation);
});
}

// Função para abrir todos os links MPMG
function openAllMPMG() {
validNumbers.forEach(function(number) {
var processNumberWithoutPunctuation = number.replace(/[^\d]/g, '');
window.open('https://aplicacao.mpmg.mp.br/pareceres/processoParecerPesquisar.do?numProcessoCorrente=0' + processNumberWithoutPunctuation);
});
}

// Função para alternar a visibilidade dos botões de ação
function toggleButtons() {
var actionButtons = document.getElementById('actionButtons');
if (document.getElementById('result').getElementsByTagName('li').length > 0) {
actionButtons.style.display = 'block';
} else {
actionButtons.style.display = 'none';
}
}

// Função para abrir o modal
function openModal() {
var modal = document.getElementById("myModal");
modal.style.display = "block";
}

// Função para fechar o modal
function closeModal() {
var modal = document.getElementById("myModal");
modal.style.display = "none";
}

// Função para atualizar o contador de processos
function updateCount() {
var countElement = document.getElementById('count');
countElement.textContent = 'Total de Números de Processo: ' + validNumbers.length;
}

var isAscending = true; // Variável para rastrear a ordem atual

// Função para alternar a ordem dos processos
function toggleOrder() {
var resultUl = document.getElementById('result');
var items = Array.from(resultUl.children);

// Classificar a lista de números em ordem crescente ou decrescente
items.sort(function(a, b) {
var numA = a.textContent.replace(/\D/g, ''); // Remover todos os caracteres não numéricos
var numB = b.textContent.replace(/\D/g, '');
if (isAscending) {
    return numA.localeCompare(numB, undefined, { numeric: true });
} else {
    return numB.localeCompare(numA, undefined, { numeric: true });
}
});

// Limpar a lista antes de adicionar os itens reordenados
resultUl.innerHTML = '';

// Adicionar os itens reordenados à lista
items.forEach(function(item) {
resultUl.appendChild(item);
});

// Alternar a ordem para a próxima vez que a função for chamada
isAscending = !isAscending;
}


// Função para verificar se a mensagem já foi exibida
function checkForUpdates() {
// Recuperar a flag que indica se a mensagem foi exibida
var messageShown = localStorage.getItem('18/09');

// Se a flag não estiver definida, exibir a mensagem
if (!messageShown) {
    // Exibir a mensagem
    alert('Novidades na página! Agora, ao copiar os números dos processos, também constarão informações sobre a quantidade total.');

    // Definir a flag para indicar que a mensagem foi exibida
    localStorage.setItem('18/09', 'true');
}
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
checkForUpdates();
});

// Função para exibir uma mensagem temporária (toast)
function showToast(message, duration = 3000) {
    // Cria o elemento do toast
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Adiciona o toast ao corpo da página
    document.body.appendChild(toast);

    // Exibe o toast
    setTimeout(function() {
        toast.classList.add('show');
    }, 100);

    // Remove o toast após o tempo especificado
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300); // Espera a animação de fade-out terminar
    }, duration);
}

// Função para enviar o número do processo para a extensão
function consultarProcessoNaExtensao(numeroProcesso, action) {
    // Verifica se a extensão está instalada e disponível
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
            "ghpcbaciheeadpgnkaomkkmhbaloaenj", // Substitua pelo ID da sua extensão
            {
                action: action, // "consultarProcessoMPMG" ou "consultarProcessoTJMG"
                numeroProcesso: numeroProcesso,
            },
            function (response) {
                if (response && response.success) {
                    console.log("Consulta iniciada com sucesso:", response.message);
                } else {
                    console.error("Erro ao iniciar consulta:", response.message);
                }
            }
        );
    } else {
        console.error("Extensão não encontrada ou não disponível.");
    }
}