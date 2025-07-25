document.addEventListener('DOMContentLoaded', function() {
    // Detecção mais robusta de iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
        document.body.classList.add('ios-device');
    }

    // Inicializar o modal de teste
    const testModalElement = document.getElementById('testModal');
    const testModal = new bootstrap.Modal(testModalElement);

    // Adicionar event listeners para os botões que abrem o modal
    ['openModalBtn', 'fabButton'].forEach(btnId => {
        document.getElementById(btnId)?.addEventListener('click', () => testModal.show());
    });

    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Usar caminho relativo para melhor compatibilidade
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrado com sucesso');
                })
                .catch(error => {
                    console.error('Falha ao registrar Service Worker:', error);
                });
        });
    }
});