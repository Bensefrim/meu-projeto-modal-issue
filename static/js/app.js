// app.js - Versão modificada com atraso e no-scroll para fixar modal no iOS

document.addEventListener('DOMContentLoaded', () => {
    const testModal = new bootstrap.Modal(document.getElementById('testModal'), {
        backdrop: 'static', // Adicionado: Previne fechamento ao clicar fora, útil para modals bottom-sheet no iOS
        keyboard: false // Opcional: Previne fechamento com teclado virtual
    });

    // Função para abrir modal com atraso (fixa rendering no iOS)
    function openModalWithDelay() {
        // Adiciona classe no-scroll ao body para prevenir scroll por trás
        document.body.classList.add('no-scroll');
        
        // Atraso de 100ms para permitir que o browser renderize corretamente (essencial no iOS)
        setTimeout(() => {
            testModal.show();
        }, 100);
    }

    // Adicionar event listeners para os botões que abrem o modal
    ['openModalBtn', 'fabButton'].forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', openModalWithDelay);
        }
    });

    // Evento para remover no-scroll ao fechar o modal
    document.getElementById('testModal').addEventListener('hidden.bs.modal', () => {
        document.body.classList.remove('no-scroll');
    });
});