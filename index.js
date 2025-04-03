// Funções de UI (mantidas)
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('active');
    document.getElementById('theme-switcher').classList.remove('active');
}


document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const container = document.querySelector('.container');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            // No topo da página - mostra o header
            header.classList.remove('hidden');
            container.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Rolando para baixo - esconde o header
            header.classList.add('hidden');
            container.classList.add('scrolled');
        } else if (currentScroll < lastScroll) {
            // Rolando para cima - mostra o header
            header.classList.remove('hidden');
            container.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
});

function toggleThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    switcher.classList.toggle('active');
    document.getElementById('dropdown-menu').classList.remove('active');
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown-menu');
    const switcher = document.getElementById('theme-switcher');
    
    if (!dropdown.contains(event.target)) dropdown.classList.remove('active');
    if (!switcher.contains(event.target)) switcher.classList.remove('active');
});

function setTheme(themeName) {
    const stylesheet = document.getElementById('themeStylesheet');
    const textElement = document.getElementById('text');
    
    // Reinicia a animação com a nova duração
    textElement.style.animation = 'none';
    void textElement.offsetWidth; // Força o recálculo
    
    // Aplica o novo tema e a animação mais lenta
    stylesheet.href = `./styles/${themeName}.css`;
    localStorage.setItem('selectedTheme', themeName);
    
    textElement.style.animation = `
        typing 5s steps(40, end) forwards,
        blink-caret 0.75s step-end infinite
    `;
    
    document.getElementById('theme-switcher').classList.remove('active');
}

// Inicialização
function init() {
    // Carrega tema salvo ou padrão
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    setTheme(savedTheme);
    

    
    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .catch(err => console.error('SW erro:', err));
        });
    }
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);