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



function processarArquivo() {
var inputFile = document.getElementById('inputFile').files[0];
var tableContainer = document.getElementById('tableContainer');
var informacoesGerais = document.getElementById('informacoesGerais');

if (!inputFile) {
alert('Por favor, selecione um arquivo.');
return;
}

// Exibe a mensagem de carregamento
tableContainer.innerHTML = '<p>Carregando, por favor aguarde...</p>';

setTimeout(function() {
var reader = new FileReader();
reader.onload = function(event) {
    var data = new Uint8Array(event.target.result);
    var workbook = XLSX.read(data, { type: 'array' });
    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    if (!jsonData[0] || jsonData[0][0] !== "PROCESSOS NA CAIXA DE DISTRIBUIÇÃO") {
        alert('O arquivo selecionado não é válido. Certifique-se de que o arquivo selecionado seja o "Relatório de Processos na Caixa de Distribuição" e esteja em formato XLS.');
        reloadPage();
        return;
    }

    // Processa os dados e constrói a tabela HTML
    var tabelaHTML = '<table>';
    var ocorrencias = { 'DEPENDÊNCIA': 0, 'DILIGÊNCIA': 0, 'PREVENÇÃO': 0, 'RODÍZIO O.G.': 0 };
    var nomesDuplicados = [];
    var procuradores = {};
    var processosMesclados = {};
    var numeroProcessoLinha = {};
    var ocorrenciasPorProcesso = {};

    var processosMarcados = new Set(); // Conjunto para armazenar processos marcados

    for (var i = 0; i < jsonData.length; i++) {
        var processo = jsonData[i][1];
        if (!numeroProcessoLinha[processo]) {
            numeroProcessoLinha[processo] = [];
        }
        numeroProcessoLinha[processo].push(i);
    }

    for (var i = 0; i < jsonData.length; i++) {
        if (i < 5) {
            tabelaHTML += '<tr class="sticky-top">';
        } else if (i == jsonData.length - 1) {
            tabelaHTML += '<tr class="sticky-bottom">';
        } else {
            tabelaHTML += '<tr>';
        }

        var processo = jsonData[i][1];
        var parte = jsonData[i][2];
        var camara = jsonData[i][3];
        var tipo = jsonData[i][10];
        var procurador = jsonData[i][11];

        // Marcar processos duplicados para verificação posterior
        if (numeroProcessoLinha[processo].length > 1 && !processosMarcados.has(processo)) {
            processosMarcados.add(processo);
            // Adiciona classe de marcação para o processo duplicado
            var processoCells = document.querySelectorAll('.col3[data-processo="' + processo + '"]');
            processoCells.forEach(cell => {
                cell.classList.add('marked-for-verification');
            });
        }

        if (!ocorrenciasPorProcesso[processo]) {
            ocorrenciasPorProcesso[processo] = true;
            if (ocorrencias.hasOwnProperty(tipo)) {
                ocorrencias[tipo]++;
            }
            if (parte && parte !== 'undefined' && parte !== 'Procurador') {
                for (var j = 0; j < jsonData.length; j++) {
                    if (j !== i && jsonData[j][2] === parte) {
                        nomesDuplicados.push(parte);
                        break;
                    }
                }
            }
            if (procurador && procurador !== 'undefined' && procurador !== 'Procurador') {
                if (procuradores.hasOwnProperty(procurador)) {
                    procuradores[procurador]++;
                } else {
                    procuradores[procurador] = 1;
                }
            }
        }

        if (!processosMesclados[processo]) {
            processosMesclados[processo] = {
                start: i,
                count: numeroProcessoLinha[processo].length
            };
        }

        for (var j = 0; j < 14; j++) {
            var cellValue = jsonData[i][j];
            var colClass = 'col' + (j + 1);

            if (i < 4) {
                if (j === 0) {
                    tabelaHTML += '<th colspan="14">' + (cellValue || '') + '</th>';
                }
            } else {
                if (j !== 2 && j !== 3 && processosMesclados[processo].start === i) {
                    // Adiciona rowspan e data-processo para a col3
                    if (j === 2) { // Se for a coluna 3
                        tabelaHTML += '<td class="' + colClass + '" rowspan="' + processosMesclados[processo].count + '" data-processo="' + processo + '">' + (cellValue || '') + '</td>';
                    } else {
                        tabelaHTML += '<td class="' + colClass + '" rowspan="' + processosMesclados[processo].count + '" data-processo="' + processo + '">' + (cellValue || '') + '</td>';
                    }
                } else if (j === 2 || j === 3) {
                    tabelaHTML += '<td class="' + colClass + '">' + (cellValue || '') + '</td>';
                }
            }
        }
        tabelaHTML += '</tr>';
    }
    tabelaHTML += '</table>';

    tableContainer.innerHTML = tabelaHTML;

// Constrói informações gerais
var infoGeralHTML = '<div class="info-container">';

// Ocorrências por tipo
infoGeralHTML += '<p><strong>Ocorrências por tipo:</strong></p><ul>';
for (var tipo in ocorrencias) {
    // Filtra procuradores relacionados ao tipo de ocorrência
    var procuradoresAssociados = Object.keys(procuradores).filter(procurador =>
        jsonData.some(row => row[10] === tipo && row[11] === procurador)
    );

    infoGeralHTML += `
        <li>
            <span class="tipo-ocorrencia" data-tipo="${tipo}">${tipo}: ${ocorrencias[tipo]}</span>
            <ul class="procuradores-lista" id="procuradores-${tipo.replace(/\s+/g, '-')}" style="display: none;">
                ${procuradoresAssociados.map(procurador => `<li>${procurador}</li>`).join('')}
            </ul>
        </li>
    `;
}
infoGeralHTML += '</ul>';

// Ocorrências por procurador (ordem alfabética)
infoGeralHTML += '<p><strong>Ocorrências por procurador (ordem alfabética):</strong></p><ul>';
Object.keys(procuradores).sort().forEach(function(procurador) {
    // Cria um conjunto único de processos associados a cada procurador
    var processosAssociados = Array.from(
        new Map(
            jsonData
                .filter(row => row[11] === procurador)
                .map(row => [row[1], row[10]]) // Par [processo, tipo] para garantir unicidade
        )
    ).map(([processo, tipo]) => ({ processo, tipo }));

    infoGeralHTML += `
        <li>
            <span class="procurador-nome" data-procurador="${procurador}">${procurador} (${procuradores[procurador]})</span>
            <ul class="processos-lista" id="processos-${procurador.replace(/\s+/g, '-')}" style="display: none;">
                ${processosAssociados.map(({ processo, tipo }) => {
                    var tipoAbreviado = tipo === 'DEPENDÊNCIA' ? 'DEP' :
                                        tipo === 'DILIGÊNCIA' ? 'DILI' :
                                        tipo === 'PREVENÇÃO' ? 'PREV' : 'OUTRO';
                    return `<li>${processo} (${tipoAbreviado})</li>`;
                }).join('')}
            </ul>
        </li>
    `;
});
infoGeralHTML += '</ul>';

infoGeralHTML += '</div>';

// Exibe as informações gerais
informacoesGerais.innerHTML = infoGeralHTML;

// Adiciona funcionalidade de expansão para ocorrências por tipo e por procurador
document.querySelectorAll('.tipo-ocorrencia').forEach(item => {
    item.addEventListener('click', function() {
        var lista = document.getElementById(`procuradores-${this.dataset.tipo.replace(/\s+/g, '-')}`);
        lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
    });
});

document.querySelectorAll('.procurador-nome').forEach(item => {
    item.addEventListener('click', function() {
        var lista = document.getElementById(`processos-${this.dataset.procurador.replace(/\s+/g, '-')}`);
        lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
    });
});


    destacarDuplicatas();
    exibirContainers();





};
reader.readAsArrayBuffer(inputFile);
}, 1);
}




function destacarDuplicatas() {
// Seleciona todas as células da coluna 3 que possuem a classe 'duplicate' ou 'highlight-yellow'
var cells = document.querySelectorAll('.col3.duplicate, .col3.highlight-yellow');

cells.forEach(cell => {
// Obtém o processo da célula atual
var processoAtual = cell.getAttribute('data-processo');

// Obtém a célula da esquerda (número do processo)
var cellLeft = cell.previousElementSibling;

// Verifica se a célula da esquerda existe e possui o mesmo número de processo
if (cellLeft && cellLeft.getAttribute('data-processo') === processoAtual) {
    // Se o número do processo é o mesmo, desconsidera
    return;
}

// Aplica o destaque na célula, caso o número do processo seja diferente
if (cell.classList.contains('duplicate')) {
    cell.style.backgroundColor = 'red';  // Destaque para duplicatas exatas
} else if (cell.classList.contains('highlight-yellow')) {
    cell.style.backgroundColor = 'yellow';  // Destaque para similares
}
});
}



function reloadPage() {
// Esconder o container da tabela
var tableContainer = document.getElementById('tableContainer');
if (tableContainer) {
tableContainer.style.display = 'none';
} else {
console.error('Elemento "tableContainer" não encontrado.');
}

// Mostrar o container de arquivo
var fileContainer = document.getElementById('fileContainer');
if (fileContainer) {
fileContainer.style.display = 'block';
} else {
console.error('Elemento "fileContainer" não encontrado.');
}

// Limpar o input de arquivo para permitir novo carregamento
var inputFile = document.getElementById('inputFile');
if (inputFile) {
inputFile.value = ''; // Limpa o campo de seleção de arquivo
} else {
console.error('Elemento "inputFile" não encontrado.');
}
}


function levenshtein(a, b) {
const alen = a.length;
const blen = b.length;
const dp = Array.from(Array(alen + 1), () => Array(blen + 1).fill(0));

for (let i = 0; i <= alen; i++) dp[i][0] = i;
for (let j = 0; j <= blen; j++) dp[0][j] = j;

for (let i = 1; i <= alen; i++) {
for (let j = 1; j <= blen; j++) {
    if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
    else dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
}
}

return dp[alen][blen];
}

function similarity(a, b) {
const maxLength = Math.max(a.length, b.length);
if (maxLength === 0) return 1.0;
const levDistance = levenshtein(a, b);
return (1.0 - (levDistance / maxLength)) * 100; // Retorna a similaridade em porcentagem
}

function destacarDuplicatas() {
var table = document.querySelector('table');
var rows = table.rows;

var termosExcluir = ["MICROREGIÃO", "JUÍZO PLANTONISTA", "JUIZ", "MINISTÉRIO", "DESEMBARGADOR", "MINISTERIO", "PROCURADOR-GERAL", "VARA DE TÓXICOS", "VARA DE TOXICOS", "ORGANIZAÇÃO CRIMINOSA", "ORGANIZACAO CRIMINOSA", "LAVAGEM DE BENS", "VARA CRIMINAL"]; // Termos para desconsiderar
var seenExact = {}; // Armazena nomes exatos já vistos
var exactMatches = []; // Armazena nomes 100% idênticos
var similarMatches = []; // Armazena pares de nomes similares

function deveDesconsiderar(nome) {
return termosExcluir.some(termo => nome.toUpperCase().includes(termo));
}

function limparNome(nome) {
return nome.trim();
}

// Função para verificar se duas células pertencem ao mesmo processo (mesmo número de processo e rowspan)
function mesmaLinhaDeProcesso(i, j) {
var processoCell1 = rows[i].querySelector('.col2'); // A coluna 2 contém o número do processo
var processoCell2 = rows[j].querySelector('.col2'); // A coluna 2 contém o número do processo

if (!processoCell1 || !processoCell2) return false;

// Verifica se o conteúdo do número do processo é igual
if (processoCell1.textContent.trim() === processoCell2.textContent.trim()) {
    return true;
}

// Verifica se a célula de processo tem um rowSpan e a célula de outro processo está dentro do rowSpan
var rowspan1 = parseInt(processoCell1.getAttribute('rowspan') || '1', 10);
var rowspan2 = parseInt(processoCell2.getAttribute('rowspan') || '1', 10);

// Se os rowspans são iguais, então eles provavelmente pertencem ao mesmo processo
if (rowspan1 > 1 || rowspan2 > 1) {
    return processoCell1.textContent.trim() === processoCell2.textContent.trim();
}

return false;
}

// Função para verificar se a célula já está marcada como highlight-yellow ou duplicate e se pertencem ao mesmo processo
function verificarSeDuplicada(i, classe) {
var parteCell = rows[i].querySelector('.col3');
if (!parteCell) return false; // Pular células sem a classe .col3

var processoCell = rows[i].querySelector('.col2'); // Coluna com o número do processo
if (!processoCell) return false;

var processoAtual = processoCell.textContent.trim();

// Verifica se a célula já tem a classe highlight-yellow ou duplicate e se pertence ao mesmo processo
var cellsComClasse = document.querySelectorAll(`.${classe}`);
for (var cell of cellsComClasse) {
    var processoCellComparar = cell.closest('tr').querySelector('.col2');
    if (processoCellComparar && processoCellComparar.textContent.trim() === processoAtual) {
        return true; // Já é uma célula com a mesma numeração de processo
    }
}

return false; // Não encontrou nenhuma célula com o mesmo processo
}

// Verifica duplicatas exatas
for (var i = 1; i < rows.length; i++) { // Pular cabeçalhos fixos, começando do índice 1
var parteCell = rows[i].querySelector('.col3');
if (!parteCell) continue; // Pular linhas sem a classe .col3

var parte = limparNome(parteCell.textContent);

if (parte !== '' && !deveDesconsiderar(parte)) {
    var processoCell = rows[i].querySelector('.col2');
    var processo = processoCell ? processoCell.textContent.trim() : null;

    // Ignora se o nome na col3 for igual ao da mesma linha no processo (exclusão de duplicados na mesma linha do processo)
    if (parte !== processo && seenExact[parte] === undefined) {
        seenExact[parte] = i;
    } else if (seenExact[parte] !== i && !mesmaLinhaDeProcesso(i, seenExact[parte]) && !verificarSeDuplicada(i, 'duplicate')) { // Verificar se não está no mesmo processo e já não é uma duplicata
        rows[seenExact[parte]].querySelector('.col3').classList.add('duplicate');
        parteCell.classList.add('duplicate');
        exactMatches.push(parte); // Armazena nomes 100% idênticos
    }
}
}

// Verifica nomes similares
for (var i = 1; i < rows.length; i++) {
var parteCell = rows[i].querySelector('.col3');
if (!parteCell) continue;

var parte = limparNome(parteCell.textContent);

if (parte !== '' && !deveDesconsiderar(parte)) {
    for (var j = i + 1; j < rows.length; j++) {
        var parteCellCompare = rows[j].querySelector('.col3');
        if (!parteCellCompare) continue;

        var parteCompare = limparNome(parteCellCompare.textContent);

        if (parteCompare !== '' && parte !== parteCompare && !deveDesconsiderar(parteCompare) && !mesmaLinhaDeProcesso(i, j) && !verificarSeDuplicada(j, 'highlight-yellow')) { // Verifica se não é uma duplicata já marcada
            var similarity = calculateNameSimilarity(parte, parteCompare); // Função de similaridade

            if (similarity >= 0.75 && j !== i) { // Verifica se estão em linhas diferentes
                parteCell.classList.add('highlight-yellow');
                parteCellCompare.classList.add('highlight-yellow');
                similarMatches.push(`${parte} - ${parteCompare}`); // Armazena nomes similares
            }
        }
    }
}
}

// Criação do resumo 
var resumoHTML = '<h2>Informações Gerais</h2><br>';
resumoHTML += '<strong>Nomes Idênticos:</strong><br>';
if (exactMatches.length > 0) {
    resumoHTML += '<ul>';
    exactMatches.forEach(function(nome) {
        resumoHTML += `
            <li>
                ${nome}
                <button class="btn-buscar" onclick="buscarNaPlanilha('${nome}')">🔍</button>
            </li>
            
        `;
    });
    resumoHTML += '</ul>';
} else {
    resumoHTML += '<p>Nenhum nome idêntico encontrado.</p>';
}

resumoHTML += '<strong>Nomes Similares:</strong><br>';
if (similarMatches.length > 0) {
    resumoHTML += '<ul>';
    similarMatches.forEach(function(par) {
        var [nome1, nome2] = par.split(' - ');
        resumoHTML += `
            <li>
                ${nome1} <button class="btn-buscar" onclick="buscarNaPlanilha('${nome1}')">🔍</button> - ${nome2}
                <button class="btn-buscar" onclick="buscarNaPlanilha('${nome2}')">🔍</button>
            </li>
        `;
    });
    resumoHTML += '</ul>';
} else {
    resumoHTML += '<p>Nenhum nome similar encontrado.</p>';
}


// Adicione esta linha para garantir que o resumo seja exibido dentro do info-container
document.querySelector('.info-container').insertAdjacentHTML('afterbegin', resumoHTML);
}

// Estilos para destaques
var style = document.createElement('style');
style.innerHTML = `
.highlight-yellow {
background-color: #ffff99; /* Amarelo claro */
font-weight: bold;
}
.duplicate {
background-color: #ff9999; /* Vermelho claro */
font-weight: bold;
}
`;
document.head.appendChild(style);


// Função para calcular a similaridade entre nomes
function calculateNameSimilarity(name1, name2) {
// Exemplo de função de similaridade usando o coeficiente de Jaccard
var set1 = new Set(name1.toLowerCase().split(/\s+/));
var set2 = new Set(name2.toLowerCase().split(/\s+/));
var intersection = new Set([...set1].filter(x => set2.has(x)));
var union = new Set([...set1, ...set2]);
return intersection.size / union.size;
}

var indiceBusca = -1; // Índice da última ocorrência encontrada
var ocorrenciasBusca = []; // Armazena todas as células que contêm o nome buscado

function buscarNaPlanilha(nome) {
    // Remove o destaque anterior (se houver)
    var celulasDestacadas = document.querySelectorAll('.highlight-busca');
    celulasDestacadas.forEach(function(celula) {
        celula.classList.remove('highlight-busca');
    });

    // Procura o nome na tabela
    var tabela = document.querySelector('table');
    var celulas = tabela.querySelectorAll('td');

    // Reinicia a busca se o nome for diferente do anterior
    if (nome !== buscarNaPlanilha.nomeAnterior) {
        indiceBusca = -1;
        ocorrenciasBusca = [];
        buscarNaPlanilha.nomeAnterior = nome; // Armazena o nome atual para comparação
    }

    // Se não houver ocorrências prévias, busca todas as células que contêm o nome
    if (ocorrenciasBusca.length === 0) {
        celulas.forEach(function(celula, index) {
            if (celula.textContent.includes(nome)) {
                ocorrenciasBusca.push(celula); // Armazena a célula que contém o nome
            }
        });

        if (ocorrenciasBusca.length === 0) {
            alert('Nome não encontrado na tabela.');
            return;
        }
    }

    // Avança para a próxima ocorrência
    indiceBusca = (indiceBusca + 1) % ocorrenciasBusca.length; // Cicla entre as ocorrências
    var celulaAtual = ocorrenciasBusca[indiceBusca];

    // Destaca a célula atual e rola até ela
    celulaAtual.classList.add('highlight-busca');
    celulaAtual.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Exibe a posição atual e o total de ocorrências
    console.log(`Ocorrência ${indiceBusca + 1} de ${ocorrenciasBusca.length}`);
}

// Variável para armazenar o nome da última busca
buscarNaPlanilha.nomeAnterior = '';


function handleFileDrop(event) {
event.preventDefault();
var inputFile = event.dataTransfer.files[0];
if (inputFile) {
    document.getElementById('inputFile').files = event.dataTransfer.files;
    document.getElementById('fileLabel').textContent = inputFile.name;
    processarArquivo();
    document.getElementById('fileContainer').style.display = 'none';
    document.getElementById('tableContainer').style.display = 'block';
    document.getElementById('informacoesGerais').style.display = 'block';
}
}



// Função que destaca a área de drag and drop
function highlight(event) {
event.preventDefault();
document.getElementById('fileContainer').classList.add('highlight');
}

// Função que remove o destaque da área de drag and drop
function unhighlight(event) {
event.preventDefault();
document.getElementById('fileContainer').classList.remove('highlight');
}

function handleFileSelect(event) {
var inputFile = event.target.files[0];
if (inputFile) {
    document.getElementById('fileLabel').textContent = inputFile.name;
    processarArquivo(inputFile);

    document.getElementById('fileContainer').style.display = 'none';
    document.getElementById('tableContainer').style.display = 'block';
    document.getElementById('informacoesGerais').style.display = 'block';
}
}


function handleDragOver(event) {
event.preventDefault();
}

// Função para calcular a distância de Levenshtein entre duas strings
function levenshteinDistance(a, b) {
const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(0));

for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

for (let i = 1; i <= a.length; i++) {
for (let j = 1; j <= b.length; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deleção
        matrix[i][j - 1] + 1,      // inserção
        matrix[i - 1][j - 1] + cost // substituição
    );
}
}

return matrix[a.length][b.length];
}

// Função para calcular a similaridade de strings usando a distância de Levenshtein
function similarityLevenshtein(name1, name2) {
const maxLength = Math.max(name1.length, name2.length);
const distance = levenshteinDistance(name1, name2);
return 1 - distance / maxLength;
}

// Função para calcular a similaridade de palavras entre os nomes
function wordSimilarity(name1, name2) {
const words1 = name1.split(' ');
const words2 = name2.split(' ');
let matches = 0;

words1.forEach(word1 => {
words2.forEach(word2 => {
    if (similarityLevenshtein(word1, word2) > 0.8) { // Considera palavras com alta similaridade
        matches++;
    }
});
});

return matches / Math.max(words1.length, words2.length);
}

// Função principal para calcular a similaridade geral entre dois nomes
function calculateNameSimilarity(name1, name2) {
const levenshteinSim = similarityLevenshtein(name1, name2);
const wordSim = wordSimilarity(name1, name2);

// Ponderação das similaridades. Ajuste os pesos conforme necessário.
return (0.6 * levenshteinSim) + (0.4 * wordSim);
}

// Função para verificar se dois nomes são similares com base em um threshold
function areNamesSimilar(name1, name2, threshold = 0.75) {
const similarity = calculateNameSimilarity(name1, name2);
return similarity >= threshold;
}


// Função para verificar se a mensagem já foi exibida
function checkForUpdates() {
// Recuperar a flag que indica se a mensagem foi exibida
var messageShown = localStorage.getItem('02/09/2024');

// Se a flag não estiver definida, exibir a mensagem
if (!messageShown) {
    // Exibir a mensagem
    alert('Novidades na página! Agora é possível encontrar nomes 100% idênticos (destaque vermelho) e também nomes similares (destaque amarelo)');

    // Definir a flag para indicar que a mensagem foi exibida
    localStorage.setItem('02/09/2024', 'true');
}
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
checkForUpdates();
});

