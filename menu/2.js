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

    // Inicialmente esconder os botões de ação
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('resultsSection').classList.add('hidden');
});

function openModal() {
    document.getElementById('myModal').style.display = "block";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

function extractProcesses() {
    var processList = document.getElementById('processList').value.replace(/(\r\n|\n|\r)/gm, '');
    processList = processList.replace(/PULOU.*?(\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3})\b/g, '$1');
    processList = processList.replace(/COMPLETOU.*?(\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3})\b/g, '$1');

    var startIndex = processList.indexOf("Entregando documentos Encaminhados");
    if (startIndex === -1) {
        searchForProcesses(); 
        return;
    }

    processList = processList.substring(startIndex);
    var processes = processList.match(/\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3} - (RP\s+)?HABEAS CORPUS - (CIVEL|CRIMINAL)(?:\s+RP)? -> ([A-Za-z\s]+)/g);
    var processByProcurador = {};
    if (processes !== null) {
        processes.forEach(function(process) {
            var procuradorMatch = process.match(/->\s+([A-Za-z\s]+)/);
            if (procuradorMatch) {
                var procurador = procuradorMatch[1].trim().replace(/\b(?:DILIG|DEPEND|PREVEN)\b/g, "").trim();
                var numeroProcesso = process.match(/\b\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3}\b/)[0];
                if (!processByProcurador[procurador]) {
                    processByProcurador[procurador] = [];
                }
                processByProcurador[procurador].push(numeroProcesso);
            }
        });

        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';
        var select = document.createElement('select');
        select.className = 'procurador-select';
        var optionDefault = new Option('Selecione um procurador', '');
        select.add(optionDefault);
        var procuradoresOrdenados = Object.keys(processByProcurador).sort();
        procuradoresOrdenados.forEach(function(procurador) {
            var option = new Option(procurador + ' - ' + processByProcurador[procurador].length + ' processo(s)', procurador);
            select.add(option);
        });

        select.onchange = function() {
            var procuradorSelecionado = select.value;
            var procuradorProcesses = processByProcurador[procuradorSelecionado];
            var resultUl = document.createElement('ul');
            resultUl.className = 'process-list';
            var links = [];

            procuradorProcesses.forEach(function(numeroProcesso) {
                var li = document.createElement('li');
                var button = document.createElement('button');
                button.className = 'btnP';
                button.textContent = numeroProcesso;
                button.onclick = function() {
                    window.open("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
                };
                links.push("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
                li.appendChild(button);
                resultUl.appendChild(li);
            });

            resultDiv.innerHTML = '';
            resultDiv.appendChild(resultUl);
            document.getElementById('count').textContent = "Total de processos encontrados para " + procuradorSelecionado + ": " + procuradorProcesses.length;
            document.getElementById('openAllButton').style.display = 'block';
            document.getElementById('copyButton').style.display = 'block';
            document.getElementById('actionButtons').style.display = 'flex';
            document.getElementById('resultsSection').classList.remove('hidden');
            
            document.getElementById('openAllButton').onclick = function() {
                links.forEach(function(link) {
                    window.open(link);
                });
            };

            document.getElementById('copyButton').onclick = function() {
                var numbersText = procuradorProcesses.join('\n');
                navigator.clipboard.writeText(numbersText).then(function() {
                    showToast("Números copiados para a área de transferência!");
                });
            };
        };

        resultDiv.appendChild(select);
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('actionButtons').style.display = 'flex';
    } else {
        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';
        var p = document.createElement('p');
        p.textContent = 'Nenhum processo encontrado no formato adequado.';
        resultDiv.appendChild(p);
        document.getElementById('resultsSection').classList.remove('hidden');
    }
}

function searchForProcesses() {
    var processList = document.getElementById('processList').value;
    var processMatches = processList.match(/(?:\b|^)(\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3}|\d{1}\.\d{4}\.\d{2}\.\d{6}-\d{1}\/\d{3}|\d{17})(?:\b|$)/g);
    if (processMatches !== null) {
        var resultUl = document.getElementById('result');
        resultUl.innerHTML = '';
        var ul = document.createElement('ul');
        ul.className = 'process-list';
        var links = [];

        processMatches.forEach(function(numeroProcesso) {
            var li = document.createElement('li');
            var button = document.createElement('button');
            button.className = 'btnP';
            button.textContent = numeroProcesso;
            button.onclick = function() {
                window.open("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
            };
            links.push("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
            li.appendChild(button);
            ul.appendChild(li);
        });

        resultUl.appendChild(ul);
        document.getElementById('count').textContent = "Total de processos encontrados: " + processMatches.length;
        document.getElementById('openAllButton').style.display = 'block';
        document.getElementById('copyButton').style.display = 'none';
        document.getElementById('actionButtons').style.display = 'flex';
        document.getElementById('resultsSection').classList.remove('hidden');
        
        document.getElementById('openAllButton').onclick = function() {
            links.forEach(function(link) {
                window.open(link);
            });
        };
    } else {
        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<p>Nenhum número de processo encontrado no formato adequado.</p>';
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('actionButtons').style.display = 'none';
    }
}

function resetForm() {
    document.getElementById('processList').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('count').textContent = '0 processos encontrados';
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('resultsSection').classList.add('hidden');
}

function copyNumbers() {
    var numbersText = validNumbers.join('\n');
    navigator.clipboard.writeText(numbersText).then(function() {
        showToast("Números copiados para a área de transferência!");
    });
}

function openAllLinks() {
    // Implementação será feita pelo select.onchange
}

function showToast(message, duration = 3000) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(function() {
        toast.classList.remove('show');
    }, duration);
}