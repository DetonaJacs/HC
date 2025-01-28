
   // Função para definir o tema
   function setTheme(themeName) {
    // Altera o href do link de estilo para o CSS correspondente ao tema escolhido
    document.getElementById('themeStylesheet').setAttribute('href', './styles/' + themeName + '.css');

    // Salva o tema selecionado no localStorage
    localStorage.setItem('selectedTheme', themeName);

    // Recarrega o texto do h1 após a troca de tema
    var textElement = document.getElementById('text');
    textElement.style.display = 'none'; // Esconde o texto
    setTimeout(function() {
        textElement.style.display = 'block'; // Mostra o texto novamente
        textElement.textContent = ''; // Atualiza o conteúdo do texto
    }, 0);

    // Fecha o menu suspenso de temas
    var themeButton = document.getElementById("theme-button");
    themeButton.classList.remove('active');
}


// Função para carregar o tema salvo no localStorage ao carregar a página
window.onload = function() {
    var savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
}

// Função para exibir/ocultar o menu suspenso
function toggleDropdown() {
    var dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle('active');
}

// Função para exibir/ocultar opções de temas
function toggleThemeOptions() {
    var themeButton = document.getElementById("theme-button");
    themeButton.classList.toggle('active');
}

    // Função para verificar se a mensagem já foi exibida
    function checkForUpdates() {
        // Recuperar a flag que indica se a mensagem foi exibida
        var messageShown = localStorage.getItem('messagestart');

        // Se a flag não estiver definida, exibir a mensagem
        if (!messageShown) {
            // Exibir a mensagem
            alert('Gostou do site? Tem alguma sugestão de melhoria? Envie-nos suas ideias! Acesse o formulário no menu para compartilhar sua opinião.');

            // Definir a flag para indicar que a mensagem foi exibida
            localStorage.setItem('messagestart', 'true');
        }
    }

    // Chamar a função ao carregar a página
    document.addEventListener('DOMContentLoaded', function() {
        checkForUpdates();
    });
	if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      console.log('Service Worker registrado com sucesso:', registration);
    }).catch(function(error) {
      console.log('Falha ao registrar o Service Worker:', error);
    });
  });
}