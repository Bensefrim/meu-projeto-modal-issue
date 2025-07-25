/**
 * Script para corrigir problemas com modais em dispositivos iOS e outros
 * Este script garante que os modais sejam exibidos corretamente em todos os dispositivos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Detectar dispositivo iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Aplicar correções específicas para iOS
    if (isIOS) {
        fixIOSModals();
    }
    
    // Aplicar correções gerais para modais
    fixModals();
    
    // Observar mudanças no DOM para corrigir modais adicionados dinamicamente
    observeModalChanges();
});

/**
 * Corrige problemas com modais em dispositivos iOS
 */
function fixIOSModals() {
    // Selecionar todos os modais
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Garantir que o modal tenha o z-index correto
        modal.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-modal');
        
        // Garantir que o conteúdo do modal tenha o z-index correto
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.zIndex = 'auto';
            modalContent.style.position = 'relative';
        }
        
        // Garantir que o backdrop tenha o z-index correto
        const modalBackdropId = modal.id + '-backdrop';
        const modalBackdrop = document.getElementById(modalBackdropId) || 
                             document.querySelector('.modal-backdrop');
        
        if (modalBackdrop) {
            modalBackdrop.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-modal-backdrop');
        }
        
        // Adicionar evento para garantir que o modal seja exibido corretamente
        modal.addEventListener('show.bs.modal', function() {
            // Forçar o reflow para garantir que o modal seja exibido corretamente
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            
            // Garantir que o backdrop seja exibido corretamente
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.style.opacity = '0.5';
                    backdrop.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-modal-backdrop');
                }
            }, 10);
        });
    });
}

/**
 * Corrige problemas gerais com modais
 */
function fixModals() {
    // Selecionar todos os modais
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Garantir que o modal tenha o z-index correto
        modal.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-modal');
        
        // Adicionar evento para garantir que o modal seja exibido corretamente
        modal.addEventListener('show.bs.modal', function() {
            // Forçar o reflow para garantir que o modal seja exibido corretamente
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.style.opacity = '0.5';
                    backdrop.style.zIndex = getComputedStyle(document.documentElement).getPropertyValue('--z-index-modal-backdrop');
                }
            }, 10);
        });
        
        // Corrigir problemas com botões dentro do modal
        const buttons = modal.querySelectorAll('button, .btn, [role="button"]');
        buttons.forEach(button => {
            button.style.position = 'relative';
            button.style.zIndex = 'auto';
        });
    });
}

/**
 * Observa mudanças no DOM para corrigir modais adicionados dinamicamente
 */
function observeModalChanges() {
    // Criar um observador de mutações
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Verificar se foram adicionados novos nós
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // Verificar se o nó é um elemento
                    if (node.nodeType === 1) {
                        // Verificar se o elemento é um modal
                        if (node.classList && node.classList.contains('modal')) {
                            // Detectar dispositivo iOS
                            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
                                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                            
                            // Aplicar correções específicas para iOS
                            if (isIOS) {
                                fixIOSModals();
                            }
                            
                            // Aplicar correções gerais para modais
                            fixModals();
                        }
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