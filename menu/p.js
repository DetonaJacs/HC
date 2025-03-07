
function processarTexto() {
    let texto = document.getElementById("inputText").value;
    let linhas = texto.split("\n");
    
    let recebidosSucesso = [];
    let atualizados = [];
    let cancelados = [];
    let erros = [];
    
    linhas.forEach(linha => {
        if (linha.includes("recebido com sucesso")) {
            recebidosSucesso.push(linha);
        } else if (linha.includes("atualizado com sucesso")) {
            atualizados.push(linha);
        } else if (linha.includes("Cancelada")) {
            cancelados.push(linha);
        } else if (linha.includes("Erro")) {
            erros.push(linha);
        }
    });
    
    document.getElementById("recebidosSucesso").innerHTML = recebidosSucesso.map(p => `<li>${p}</li>`).join("");
    document.getElementById("atualizados").innerHTML = atualizados.map(p => `<li>${p}</li>`).join("");
    document.getElementById("cancelados").innerHTML = cancelados.map(p => `<li>${p}</li>`).join("");
    document.getElementById("erros").innerHTML = erros.map(p => `<li>${p}</li>`).join("");
    
    document.getElementById("countRecebidosSucesso").textContent = recebidosSucesso.length;
    document.getElementById("countAtualizados").textContent = atualizados.length;
    document.getElementById("countCancelados").textContent = cancelados.length;
    document.getElementById("countErros").textContent = erros.length;
    
    let total = recebidosSucesso.length + atualizados.length + cancelados.length + erros.length;
    document.getElementById("totalProcessos").textContent = total;
}

function copiarResultados() {
    let resultados = "";
    resultados += `Total de Processos: ${document.getElementById("totalProcessos").textContent}\n`;
    resultados += `Recebidos com Sucesso (${document.getElementById("countRecebidosSucesso").textContent}):\n`;
    resultados += [...document.getElementById("recebidosSucesso").children].map(li => li.textContent).join("\n") + "\n\n";
    resultados += `Atualizados (${document.getElementById("countAtualizados").textContent}):\n`;
    resultados += [...document.getElementById("atualizados").children].map(li => li.textContent).join("\n") + "\n\n";
    resultados += `Cancelados (${document.getElementById("countCancelados").textContent}):\n`;
    resultados += [...document.getElementById("cancelados").children].map(li => li.textContent).join("\n") + "\n\n";
    resultados += `Erros (${document.getElementById("countErros").textContent}):\n`;
    resultados += [...document.getElementById("erros").children].map(li => li.textContent).join("\n") + "\n";
    
    navigator.clipboard.writeText(resultados).then(() => {
        alert("Resultados copiados para a área de transferência!");
    }).catch(err => {
        alert("Erro ao copiar resultados: " + err);
    });
}
