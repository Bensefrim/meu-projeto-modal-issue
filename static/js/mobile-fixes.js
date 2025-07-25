/**
 * Script para corrigir problemas de interação em dispositivos móveis
 * Este script garante que os botões de função (adicionar, editar, detalhar, excluir) 
 * funcionem corretamente em dispositivos móveis, especialmente em iOS.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Detectar dispositivo iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Detectar modo standalone (PWA instalado)
    const isInStandaloneMode = () =>
        (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone) ||
        document.referrer.includes('android-app://');

    // Aplicar classes específicas para iOS
    if (isIOS) {
        document.body.classList.add('ios-device');
        
        // Aplicar classes iOS para o menu móvel
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('ios-mobile-menu');
            
            // Aplicar classes iOS para os links do menu móvel
            const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-links a');
            menuLinks.forEach(link => {
                link.classList.add('ios-menu-link');
            });
        }
    }

    // Configurar PWA
    if (isInStandaloneMode()) {
        // Adicionar classe para estilos específicos de PWA
        document.body.classList.add('pwa-mode');
        
        // Mostrar navegação estilo app
        const appNavigation = document.getElementById('app-navigation');
        if (appNavigation) {
            appNavigation.classList.add('active');
            
            // Esconder menu padrão em modo PWA mobile
            const standardNav = document.querySelector('.nav-links');
            const isMobile = window.innerWidth < 768;
            
            if (standardNav && isMobile) {
                standardNav.style.display = 'none';
            }
            
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
            
            // Adicionar efeito de feedback tátil aos botões de navegação
            navLinks.forEach(link => {
                link.addEventListener('click', function () {
                    // Remover classe ativa de todos os links
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Adicionar classe ativa ao link clicado
                    this.classList.add('active');
                });
            });
        }
    }

    // Corrigir problemas com botões em dispositivos móveis
    fixMobileButtons();

    // Observar mudanças no DOM para corrigir botões adicionados dinamicamente
    observeDOMChanges();
    
    // Configurar menu móvel
    setupMobileMenu();
    
    // Configurar dropdowns
    setupDropdowns();
    
    // Configurar botão FAB
    setupFAB();
    
    // Prevenir comportamento de bounce no iOS
    if (isIOS) {
        document.body.addEventListener('touchmove', function (e) {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevenir zoom com duplo toque
        document.addEventListener('touchstart', function (event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
    }
});

/**
 * Corrige problemas com botões em dispositivos móveis
 */
function fixMobileButtons() {
    // Selecionar todos os botões de ação
    const actionButtons = document.querySelectorAll('.btn, button, a[role="button"], [type="button"], [type="submit"]');

    // Aplicar correções a cada botão
    actionButtons.forEach(button => {
        enhanceButtonInteractivity(button);
    });
}

/**
 * Melhora a interatividade dos botões
 */
function enhanceButtonInteractivity(button) {
    // Adicionar evento de toque para melhorar a resposta em dispositivos móveis
    button.addEventListener('touchstart', function (e) {
        // Não propagar o evento para evitar que outros elementos o capturem
        e.stopPropagation();
    }, { passive: false });

    button.addEventListener('touchend', function (e) {
        // Simular um clique se o evento de toque não for processado corretamente
        if (e.cancelable) {
            e.preventDefault();

            // Disparar evento de clique
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            button.dispatchEvent(clickEvent);
        }
    }, { passive: false });
}

/**
 * Observa mudanças no DOM para corrigir botões adicionados dinamicamente
 */
function observeDOMChanges() {
    // Criar um observador de mutações
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // Verificar se foram adicionados novos nós
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function (node) {
                    // Verificar se o nó é um elemento
                    if (node.nodeType === 1) {
                        // Verificar se o elemento é um botão
                        if (node.classList && (node.classList.contains('btn') || node.tagName === 'BUTTON')) {
                            enhanceButtonInteractivity(node);
                        }

                        // Verificar se o elemento contém botões
                        const buttons = node.querySelectorAll('.btn, button, a[role="button"], [type="button"], [type="submit"]');
                        buttons.forEach(button => {
                            enhanceButtonInteractivity(button);
                        });
                    }
                });
            }
        });
    });

    // Configurar o observador para monitorar todo o documento
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * Configura o menu móvel
 */
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
        mobileMenuToggle.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            document.body.classList.add('no-scroll'); // Impedir rolagem quando menu está aberto

            // Esconder o FAB quando o menu estiver aberto
            const fabContainer = document.getElementById('fab-container');
            if (fabContainer) {
                fabContainer.classList.remove('fab-visible');
            }
        });

        mobileMenuClose.addEventListener('click', function () {
            closeMobileMenu();
        });

        // Fechar menu ao clicar em um link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function () {
                closeMobileMenu();
            });
        });

        // Adicionar funcionalidade de logout ao botão do menu móvel
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof logout === 'function') {
                    logout();
                }
            });
        }
    }
}

/**
 * Fecha o menu móvel e restaura o FAB se necessário
 */
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('no-scroll'); // Restaurar rolagem
    }

    // Mostrar o FAB novamente se estiver em uma página que deve mostrá-lo
    const fabContainer = document.getElementById('fab-container');
    if (fabContainer) {
        updateFABVisibility();
    }
}

/**
 * Configura os dropdowns do menu desktop
 */
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();

                // Posicionar o menu dropdown
                const toggleRect = toggle.getBoundingClientRect();

                // Armazenar posições como atributos data
                menu.dataset.top = (toggleRect.bottom + window.scrollY);
                menu.dataset.left = (toggleRect.left + window.scrollX);

                // Verificar se o menu vai sair da tela à direita
                const menuWidth = menu.offsetWidth;
                const windowWidth = window.innerWidth;
                if (toggleRect.left + menuWidth > windowWidth) {
                    menu.dataset.left = (toggleRect.right - menuWidth + window.scrollX);
                    menu.classList.add('dropdown-menu-right');
                } else {
                    menu.classList.remove('dropdown-menu-right');
                }

                menu.classList.toggle('show');

                // Aplicar posições via CSS
                if (menu.classList.contains('show')) {
                    menu.style.top = menu.dataset.top + 'px';
                    menu.style.left = menu.dataset.left + 'px';
                }
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', function (e) {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        }
    });
}

/**
 * Configura o botão FAB (Floating Action Button)
 */
function setupFAB() {
    // Remover qualquer FAB duplicado que possa existir
    const fabContainers = document.querySelectorAll('.custom-fab-container');
    if (fabContainers.length > 1) {
        console.warn('Múltiplos FABs detectados. Removendo duplicatas.');
        for (let i = 1; i < fabContainers.length; i++) {
            fabContainers[i].remove();
        }
    }

    const fabButton = document.getElementById('fab-button');
    const fabContainer = document.getElementById('fab-container');

    if (fabButton && fabContainer) {
        // Atualizar visibilidade do FAB
        updateFABVisibility();

        fabButton.addEventListener('click', function () {
            // Redirecionar para a página de adicionar novo item
            const currentPath = window.location.pathname;
            
            if (currentPath === '/fazendas' || currentPath === '/fazendas/') {
                window.location.href = '/fazendas/adicionar';
            } else if (currentPath === '/animais' || currentPath === '/animais/') {
                window.location.href = '/animais/adicionar';
            } else if (currentPath === '/usuarios' || currentPath === '/usuarios/') {
                window.location.href = '/usuarios/adicionar';
            } else {
                // Página padrão para adicionar
                window.location.href = '/dashboard';
            }
        });

        // Atualizar visibilidade do FAB ao redimensionar a janela
        window.addEventListener('resize', updateFABVisibility);
        
        // Verificar a posição do FAB após o carregamento completo da página
        window.addEventListener('load', updateFABVisibility);
    }
}

/**
 * Atualiza a visibilidade do FAB com base na página atual e no modo de exibição
 */
function updateFABVisibility() {
    const fabContainer = document.getElementById('fab-container');
    if (!fabContainer) return;
    
    // Verificar se estamos em uma página que deve mostrar o FAB
    const currentPath = window.location.pathname;
    
    // Lista de caminhos exatos onde o FAB deve aparecer
    const showFabOn = [
        '/fazendas',
        '/animais',
        '/usuarios'
    ];
    
    // Verificar se o caminho atual está na lista de páginas que devem mostrar o FAB
    const shouldShowFab = showFabOn.some(path =>
        currentPath === path ||
        currentPath === path + '/'
    );
    
    // Verificar se estamos em modo PWA ou mobile
    const isInStandaloneMode = () => {
        return (window.matchMedia('(display-mode: standalone)').matches) ||
            (window.navigator.standalone) ||
            document.referrer.includes('android-app://');
    };
    
    const isMobile = window.innerWidth < 768;
    
    // Verificar se o menu mobile está aberto
    const mobileMenu = document.getElementById('mobile-menu');
    const isMenuOpen = mobileMenu && mobileMenu.classList.contains('active');
    
    // Mostrar o FAB apenas nas páginas relevantes E APENAS em modo PWA ou mobile
    // E APENAS quando o menu mobile não estiver aberto
    if (shouldShowFab && (isInStandaloneMode() || isMobile) && !isMenuOpen) {
        // Verificar se é um dispositivo iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        fabContainer.classList.add('fab-visible');
        
        // Aplicar classe específica para iOS se necessário
        if (isIOS) {
            fabContainer.classList.add('ios-fab');
        } else {
            fabContainer.classList.remove('ios-fab');
        }
    } else {
        fabContainer.classList.remove('fab-visible');
    }
}

// Registrar o service worker e forçar atualização
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/static/service-worker.js')
            .then(function (registration) {
                console.log('Service Worker registrado com sucesso:', registration.scope);

                // Verificar se há uma atualização do service worker
                registration.addEventListener('updatefound', function () {
                    // Quando uma atualização é encontrada, obter o novo service worker
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', function () {
                        // Quando o novo service worker estiver instalado, forçar a ativação
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                console.log('Nova versão do Service Worker disponível, atualizando...');
                                registration.waiting.postMessage({ type: 'SKIP_WAITING' });

                                // Limpar o cache do CSS
                                caches.open('pecuaria-v4').then(function (cache) {
                                    // Forçar a atualização do CSS no cache
                                    fetch('/static/css/styles.css?v=' + new Date().getTime(), { cache: 'no-store' })
                                        .then(function (response) {
                                            return cache.put('/static/css/styles.css', response);
                                        })
                                        .then(function () {
                                            console.log('Cache do CSS atualizado com sucesso');
                                            // Recarregar a página para aplicar as alterações
                                            window.location.reload();
                                        });
                                });
                            }
                        }
                    });
                });

                // Verificar se há uma atualização disponível
                registration.update();
            })
            .catch(function (error) {
                console.log('Falha ao registrar o Service Worker:', error);
            });

        // Lidar com a atualização do service worker
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            console.log('Service Worker atualizado, recarregando a página...');
        });
    });
}