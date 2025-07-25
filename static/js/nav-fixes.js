/**
 * Script para corrigir problemas com navegação em dispositivos iOS e outros
 * Este script garante que os botões de navegação tenham o mesmo tamanho em todas as páginas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detectar dispositivo iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detectar modo standalone (PWA instalado)
    const isInStandaloneMode = () =>
        (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone) ||
        document.referrer.includes('android-app://');
    
    // Aplicar correções específicas para iOS
    if (isIOS) {
        fixIOSNavigation();
    }
    
    // Aplicar correções gerais para navegação
    fixNavigation();
    
    // Verificar se estamos em modo PWA
    if (isInStandaloneMode()) {
        // Mostrar navegação estilo app
        const appNavigation = document.getElementById('app-navigation');
        if (appNavigation) {
            appNavigation.classList.add('active');
            
            // Marcar o item de navegação ativo
            const currentPath = window.location.pathname;
            const navLinks = appNavigation.querySelectorAll('a');
            
            navLinks.forEach(link => {
                if (currentPath.includes(link.getAttribute('href'))) {
                    link.classList.add('active');
                }
            });
            
            // Caso especial para dashboard
            if (currentPath === '/dashboard' || currentPath === '/') {
                const dashboardLink = document.getElementById('nav-dashboard');
                if (dashboardLink) dashboardLink.classList.add('active');
            }
        }
    }
});

/**
 * Corrige problemas com navegação em dispositivos iOS
 */
function fixIOSNavigation() {
    // Selecionar a navegação de app
    const appNavigation = document.getElementById('app-navigation');
    if (!appNavigation) return;
    
    // Garantir que a navegação tenha o z-index correto
    appNavigation.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-app-nav');
    
    // Garantir que os links de navegação tenham o mesmo tamanho
    const navLinks = appNavigation.querySelectorAll('a');
    navLinks.forEach(link => {
        // Aplicar estilos para garantir que os links tenham o mesmo tamanho
        link.style.minHeight = '70px';
        
        // Garantir que os ícones tenham o mesmo tamanho
        const icon = link.querySelector('i');
        if (icon) {
            icon.style.fontSize = '1.75rem';
            icon.style.marginBottom = '5px';
        }
        
        // Garantir que os textos tenham o mesmo tamanho
        const span = link.querySelector('span');
        if (span) {
            span.style.fontSize = '0.8rem';
            span.style.fontWeight = '500';
        }
    });
}

/**
 * Corrige problemas gerais com navegação
 */
function fixNavigation() {
    // Selecionar a navegação de app
    const appNavigation = document.getElementById('app-navigation');
    if (!appNavigation) return;
    
    // Garantir que a navegação tenha o z-index correto
    appNavigation.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-app-nav');
    
    // Garantir que os links de navegação tenham o mesmo tamanho
    const navLinks = appNavigation.querySelectorAll('a');
    navLinks.forEach(link => {
        // Aplicar estilos para garantir que os links tenham o mesmo tamanho
        link.style.minHeight = '60px';
        
        // Garantir que os ícones tenham o mesmo tamanho
        const icon = link.querySelector('i');
        if (icon) {
            icon.style.fontSize = '1.5rem';
            icon.style.marginBottom = '5px';
        }
        
        // Garantir que os textos tenham o mesmo tamanho
        const span = link.querySelector('span');
        if (span) {
            span.style.fontSize = '0.75rem';
        }
        
        // Adicionar efeito de feedback tátil aos botões de navegação
        link.addEventListener('click', function() {
            // Remover classe ativa de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            // Adicionar classe ativa ao link clicado
            this.classList.add('active');
        });
    });
    
    // Verificar o tamanho da tela e ajustar a navegação
    function adjustNavigation() {
        if (window.innerWidth <= 320) {
            // Ajustar para telas muito pequenas
            navLinks.forEach(link => {
                const icon = link.querySelector('i');
                if (icon) {
                    icon.style.fontSize = '1.4rem';
                }
                
                const span = link.querySelector('span');
                if (span) {
                    span.style.fontSize = '0.7rem';
                }
            });
        } else {
            // Restaurar para telas normais
            navLinks.forEach(link => {
                const icon = link.querySelector('i');
                if (icon) {
                    icon.style.fontSize = '1.5rem';
                }
                
                const span = link.querySelector('span');
                if (span) {
                    span.style.fontSize = '0.75rem';
                }
            });
        }
    }
    
    // Ajustar a navegação ao carregar a página
    adjustNavigation();
    
    // Ajustar a navegação ao redimensionar a janela
    window.addEventListener('resize', adjustNavigation);
}