/**
 * Script para garantir o comportamento correto dos modais
 * Este arquivo contém código para corrigir problemas específicos com modais em dispositivos móveis e PWA
 */

document.addEventListener('DOMContentLoaded', function() {
    // Função para corrigir problemas com modais
    function fixModals() {
        // Garantir que o body não tenha position:fixed quando um modal estiver aberto
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const body = document.body;
                    if (body.classList.contains('modal-open')) {
                        // Remover position:fixed do body e html
                        document.documentElement.style.position = '';
                        body.style.position = '';
                        
                        // Garantir que o backdrop esteja visível e com z-index correto
                        const backdrops = document.querySelectorAll('.modal-backdrop');
                        backdrops.forEach(function(backdrop) {
                            backdrop.style.zIndex = '1040';
                            backdrop.style.opacity = '0.5';
                            backdrop.style.pointerEvents = 'auto';
                        });
                        
                        // Garantir que os modais estejam com z-index correto
                        const modals = document.querySelectorAll('.modal.show');
                        modals.forEach(function(modal) {
                            modal.style.zIndex = '1050';
                            
                            // Garantir que o modal-dialog esteja com z-index correto
                            const dialog = modal.querySelector('.modal-dialog');
                            if (dialog) {
                                dialog.style.zIndex = '1060';
                            }
                        });
                    }
                }
            });
        });
        
        observer.observe(document.body, { attributes: true });
    }
    
    // Função para corrigir problemas com modais em dispositivos iOS
    function fixIOSModals() {
        // Verificar se é um dispositivo iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            // Adicionar classe para identificar dispositivos iOS
            document.body.classList.add('ios-device');
            
            // Corrigir problemas com modais em iOS
            const modals = document.querySelectorAll('.modal');
            modals.forEach(function(modal) {
                // Garantir que o modal seja visível em iOS
                modal.addEventListener('show.bs.modal', function() {
                    // Forçar reflow para garantir que o modal seja renderizado corretamente
                    modal.style.display = 'flex';
                    modal.style.alignItems = 'center';
                    modal.style.justifyContent = 'center';
                    
                    // Garantir que o backdrop seja visível
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.style.opacity = '0.5';
                        backdrop.style.pointerEvents = 'auto';
                    }
                    
                    // Desabilitar scroll no body
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                });
                
                // Restaurar scroll quando o modal for fechado
                modal.addEventListener('hidden.bs.modal', function() {
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                });
            });
        }
    }
    
    // Função para corrigir problemas com modais em PWA
    function fixPWAModals() {
        // Verificar se está em modo standalone (PWA)
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone || 
                      document.referrer.includes('android-app://');
        
        if (isPWA) {
            // Adicionar classe para identificar modo PWA
            document.body.classList.add('pwa-mode');
            
            // Corrigir problemas com modais em PWA
            const modals = document.querySelectorAll('.modal');
            modals.forEach(function(modal) {
                // Garantir que o modal seja visível em PWA
                modal.addEventListener('show.bs.modal', function() {
                    // Forçar reflow para garantir que o modal seja renderizado corretamente
                    modal.style.display = 'flex';
                    modal.style.alignItems = 'center';
                    modal.style.justifyContent = 'center';
                    
                    // Garantir que o backdrop seja visível
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.style.opacity = '0.5';
                        backdrop.style.pointerEvents = 'auto';
                    }
                });
            });
        }
    }
    
    // Executar as funções de correção
    fixModals();
    fixIOSModals();
    fixPWAModals();
    
    // Adicionar evento para garantir que os modais funcionem corretamente após o carregamento da página
    window.addEventListener('load', function() {
        fixModals();
        fixIOSModals();
        fixPWAModals();
    });
});