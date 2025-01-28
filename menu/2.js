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

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("infoIcon").addEventListener("click", openModal);
    document.getElementById("myModal").querySelector(".close").addEventListener("click", closeModal);

    function openModal() {
        document.getElementById('myModal').style.display = "block";
    }

    function closeModal() {
        document.getElementById('myModal').style.display = "none";
    }

    window.extractProcesses = function() {
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
                var links = [];

                procuradorProcesses.forEach(function(numeroProcesso) {
                    var li = document.createElement('li');
                    var button = document.createElement('button');
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
                document.getElementById('copyButton').style.display = 'block'; // Mostra o botão 'Copiar Números'
                document.getElementById('openAllButton').onclick = function() {
                    links.forEach(function(link) {
                        window.open(link);
                    });
                };

                document.getElementById('copyButton').onclick = function() {
                    var numbersText = procuradorProcesses.join('\n');
                    navigator.clipboard.writeText(numbersText);
                    alert("Números copiados para a área de transferência!");
                };
            };

            resultDiv.appendChild(select);
        } else {
            var resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';
            var p = document.createElement('p');
            p.textContent = 'Nenhum processo encontrado no formato adequado.';
            resultDiv.appendChild(p);
        }
    }

    window.searchForProcesses = function() {
        var processList = document.getElementById('processList').value;
        var processMatches = processList.match(/(?:\b|^)(\d{1}\.\d{4}\.\d{2}\.\d{3}\.\d{3}-\d{1}\/\d{3}|\d{1}\.\d{4}\.\d{2}\.\d{6}-\d{1}\/\d{3}|\d{17})(?:\b|$)/g);
        if (processMatches !== null) {
            var resultUl = document.getElementById('result');
            resultUl.innerHTML = '';
            var links = [];

            processMatches.forEach(function(numeroProcesso) {
                var li = document.createElement('li');
                var button = document.createElement('button');
                button.textContent = numeroProcesso;
                button.onclick = function() {
                    window.open("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
                };
                links.push("https://www4.tjmg.jus.br/juridico/sf/proc_partes_advogados2.jsp?listaProcessos=" + numeroProcesso.replace(/\D/g,''));
                li.appendChild(button);
                resultUl.appendChild(li);
            });

            document.getElementById('openAllButton').style.display = 'block';
            document.getElementById('copyButton').style.display = 'none';
            document.getElementById('openAllButton').onclick = function() {
                links.forEach(function(link) {
                    window.open(link);
                });
            };
        } else {
            alert("Nenhum número de processo encontrado no formato adequado.");
        }
    }

    window.resetForm = function() {
        document.getElementById('processList').value = '';
        document.getElementById('result').innerHTML = '';
        document.getElementById('count').textContent = '';
        document.getElementById('copyButton').style.display = 'none';
        document.getElementById('openAllButton').style.display = 'none';
    }
});

// Função para copiar números de processo
function copyNumbers() {
    var numbersText = validNumbers.join('\n');
    
    // Copiar os números para a área de transferência
    navigator.clipboard.writeText(numbersText).then(function() {
        // Exibir o alerta após a cópia ser concluída
        alert("Números copiados para a área de transferência!");
    }).catch(function(error) {
        // Lidar com qualquer erro que possa ocorrer durante a cópia
        console.error('Erro ao copiar para a área de transferência: ', error);
    });
}