// Variáveis globais
let usuarioIdParaExcluir = null;
let usuarioModal = null;
let confirmDeleteModal = null;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modais
    usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    
    // Carregar usuários
    carregarUsuarios();
    
    // Adicionar evento de busca ao pressionar Enter
    document.getElementById('busca-usuario').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarUsuarios();
        }
    });
    
    // Inicializar indicador de rolagem para tabelas responsivas
    inicializarIndicadorRolagem();
    
    // Inicializar pull-to-refresh
    inicializarPullToRefresh();
    
    // Configurar comportamento do campo de senha
    const usuarioId = document.getElementById('usuario-id');
    const senhaContainer = document.querySelector('.senha-container');
    const senhaHelp = document.querySelector('.senha-help');
    
    // Observar mudanças no campo de ID para ajustar o comportamento do campo de senha
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                const isEditing = usuarioId.value !== '';
                if (isEditing) {
                    document.getElementById('usuario-senha').removeAttribute('required');
                    senhaHelp.style.display = 'block';
                } else {
                    document.getElementById('usuario-senha').setAttribute('required', 'required');
                    senhaHelp.style.display = 'none';
                }
            }
        });
    });
    
    observer.observe(usuarioId, { attributes: true });
});

// Função para carregar todos os usuários
async function carregarUsuarios() {
    try {
        mostrarLoading(true);
        
        const response = await fetch('/api/usuarios', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderizarUsuarios(data.usuarios);
        } else {
            showAlert('error', data.error || 'Erro ao carregar usuários');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showAlert('error', 'Erro ao carregar usuários');
    } finally {
        mostrarLoading(false);
    }
}

// Função para buscar usuários
function buscarUsuarios() {
    const termoBusca = document.getElementById('busca-usuario').value.trim();
    
    if (termoBusca === '') {
        carregarUsuarios();
        return;
    }
    
    buscarUsuariosPorTermo(termoBusca);
}

// Função para buscar usuários por termo
async function buscarUsuariosPorTermo(termo) {
    try {
        mostrarLoading(true);
        
        const response = await fetch(`/api/usuarios?busca=${encodeURIComponent(termo)}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderizarUsuarios(data.usuarios);
        } else {
            showAlert('error', data.error || 'Erro ao buscar usuários');
        }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        showAlert('error', 'Erro ao buscar usuários');
    } finally {
        mostrarLoading(false);
    }
}

// Função para renderizar usuários na tabela
function renderizarUsuarios(usuarios) {
    const tableBody = document.getElementById('usuarios-table-body');
    const emptyMessage = document.getElementById('usuarios-empty');
    
    tableBody.innerHTML = '';
    
    if (usuarios.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        
        // Formatar o tipo de usuário para exibição
        let tipoFormatado = 'Desconhecido';
        switch (usuario.tipo_usuario) {
            case 'admin':
                tipoFormatado = 'Administrador';
                break;
            case 'gerente':
                tipoFormatado = 'Gerente';
                break;
            case 'operador':
                tipoFormatado = 'Operador';
                break;
        }
        
        // Formatar a data de último login
        const ultimoLogin = usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleString() : 'Nunca';
        
        row.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td class="hide-xs">${tipoFormatado}</td>
            <td class="hide-xs">${ultimoLogin}</td>
            <td>${usuario.ativo ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-danger">Inativo</span>'}</td>
            <td>
                <div class="d-flex flex-column flex-sm-row">
                    <button class="btn btn-sm btn-info mb-1 mb-sm-0 me-sm-1" onclick="editarUsuario(${usuario.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1 mb-sm-0 me-sm-1" onclick="excluirUsuario(${usuario.id}, '${usuario.nome}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary d-inline-block d-sm-none" onclick="mostrarDetalhesUsuario(${usuario.id})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Disparar evento personalizado para indicar que os usuários foram carregados
    document.dispatchEvent(new CustomEvent('usuariosCarregados'));
}

// Função para mostrar/esconder o loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('usuarios-loading');
    loading.style.display = mostrar ? 'block' : 'none';
}

// Função para mostrar o modal de cadastro de usuário
function showUsuarioModal() {
    // Limpar o formulário
    document.getElementById('usuario-form').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuarioModalLabel').textContent = 'Novo Usuário';
    
    // Tornar o campo de senha obrigatório para novos usuários
    document.getElementById('usuario-senha').setAttribute('required', 'required');
    document.querySelector('.senha-help').style.display = 'none';
    
    // Mostrar o modal
    usuarioModal.show();
}

// Função para editar um usuário
async function editarUsuario(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            const usuario = data.usuario;
            
            // Preencher o formulário
            document.getElementById('usuario-id').value = usuario.id;
            document.getElementById('usuario-nome').value = usuario.nome || '';
            document.getElementById('usuario-email').value = usuario.email || '';
            document.getElementById('usuario-senha').value = ''; // Não preencher a senha
            document.getElementById('usuario-tipo').value = usuario.tipo_usuario || '';
            document.getElementById('usuario-ativo').checked = usuario.ativo;
            document.getElementById('usuario-senha-temporaria').checked = usuario.senha_temporaria;
            
            // Tornar o campo de senha opcional para edição
            document.getElementById('usuario-senha').removeAttribute('required');
            document.querySelector('.senha-help').style.display = 'block';
            
            // Atualizar o título do modal
            document.getElementById('usuarioModalLabel').textContent = 'Editar Usuário';
            
            // Mostrar o modal
            usuarioModal.show();
        } else {
            showAlert('error', data.error || 'Erro ao carregar dados do usuário');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showAlert('error', 'Erro ao carregar dados do usuário');
    }
}

// Função para salvar um usuário (criar ou atualizar)
async function salvarUsuario() {
    // Validar o formulário
    const form = document.getElementById('usuario-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Obter os dados do formulário
    const id = document.getElementById('usuario-id').value;
    const senha = document.getElementById('usuario-senha').value;
    
    const usuario = {
        nome: document.getElementById('usuario-nome').value,
        email: document.getElementById('usuario-email').value,
        tipo_usuario: document.getElementById('usuario-tipo').value,
        ativo: document.getElementById('usuario-ativo').checked,
        senha_temporaria: document.getElementById('usuario-senha-temporaria').checked
    };
    
    // Adicionar senha apenas se for fornecida ou se for um novo usuário
    if (senha || !id) {
        usuario.senha = senha;
    }
    
    try {
        let url = '/api/usuarios';
        let method = 'POST';
        
        if (id) {
            url = `/api/usuarios/${id}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(usuario)
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message || 'Usuário salvo com sucesso');
            usuarioModal.hide();
            carregarUsuarios();
        } else {
            showAlert('error', data.error || 'Erro ao salvar usuário');
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showAlert('error', 'Erro ao salvar usuário');
    }
}

// Função para mostrar o modal de confirmação de exclusão
function excluirUsuario(id, nome) {
    usuarioIdParaExcluir = id;
    document.getElementById('delete-usuario-nome').textContent = nome;
    confirmDeleteModal.show();
}

// Função para confirmar a exclusão de um usuário
async function confirmarExclusaoUsuario() {
    if (!usuarioIdParaExcluir) return;
    
    try {
        const response = await fetch(`/api/usuarios/${usuarioIdParaExcluir}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message || 'Usuário excluído com sucesso');
            confirmDeleteModal.hide();
            carregarUsuarios();
        } else {
            showAlert('error', data.error || 'Erro ao excluir usuário');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showAlert('error', 'Erro ao excluir usuário');
    } finally {
        usuarioIdParaExcluir = null;
    }
}

// Função para mostrar detalhes do usuário em um modal (para dispositivos móveis)
async function mostrarDetalhesUsuario(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            const usuario = data.usuario;
            
            // Armazenar o ID do usuário para uso posterior
            document.getElementById('detalhesUsuarioModal').setAttribute('data-usuario-id', usuario.id);
            
            // Formatar o tipo de usuário para exibição
            let tipoFormatado = 'Desconhecido';
            switch (usuario.tipo_usuario) {
                case 'admin':
                    tipoFormatado = 'Administrador';
                    break;
                case 'gerente':
                    tipoFormatado = 'Gerente';
                    break;
                case 'operador':
                    tipoFormatado = 'Operador';
                    break;
            }
            
            // Formatar a data de último login
            const ultimoLogin = usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleString() : 'Nunca';
            
            // Preencher o modal de detalhes
            document.getElementById('detalhe-usuario-nome').textContent = usuario.nome || '-';
            document.getElementById('detalhe-usuario-email').textContent = usuario.email || '-';
            document.getElementById('detalhe-usuario-tipo').textContent = tipoFormatado;
            document.getElementById('detalhe-usuario-ultimo-login').textContent = ultimoLogin;
            document.getElementById('detalhe-usuario-senha-temporaria').textContent = usuario.senha_temporaria ? 'Sim' : 'Não';
            document.getElementById('detalhe-usuario-status').innerHTML = usuario.ativo ?
                '<span class="badge bg-success">Ativo</span>' :
                '<span class="badge bg-danger">Inativo</span>';
            
            // Mostrar o modal
            const detalhesUsuarioModal = new bootstrap.Modal(document.getElementById('detalhesUsuarioModal'));
            detalhesUsuarioModal.show();
        } else {
            showAlert('error', data.error || 'Erro ao carregar dados do usuário');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        showAlert('error', 'Erro ao carregar dados do usuário');
    }
}

// Função para editar o usuário a partir do modal de detalhes
function editarUsuarioDoModal() {
    const modal = document.getElementById('detalhesUsuarioModal');
    const usuarioId = modal.getAttribute('data-usuario-id');
    
    // Fechar o modal de detalhes
    const detalhesUsuarioModal = bootstrap.Modal.getInstance(modal);
    detalhesUsuarioModal.hide();
    
    // Abrir o modal de edição
    if (usuarioId) {
        editarUsuario(parseInt(usuarioId));
    }
}

// Função auxiliar para mostrar alertas
function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    alertDiv.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    // Remover o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Função para inicializar o indicador de rolagem para tabelas responsivas
function inicializarIndicadorRolagem() {
    const tableResponsive = document.querySelector('.table-responsive');
    if (!tableResponsive) return;
    
    // Verificar se a tabela é maior que o contêiner
    function verificarNecessidadeRolagem() {
        const table = tableResponsive.querySelector('table');
        if (!table) return;
        
        // Se a tabela for maior que o contêiner, mostrar o indicador
        if (table.offsetWidth > tableResponsive.offsetWidth) {
            tableResponsive.classList.add('needs-scroll');
            
            // Criar o indicador se não existir
            if (!document.getElementById('scroll-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'scroll-indicator';
                indicator.className = 'scroll-indicator';
                indicator.innerHTML = '<i class="fas fa-arrow-left"></i> Deslize <i class="fas fa-arrow-right"></i>';
                tableResponsive.appendChild(indicator);
                
                // Esconder o indicador após 3 segundos
                setTimeout(() => {
                    indicator.style.opacity = '0';
                }, 3000);
                
                // Esconder o indicador quando o usuário rolar a tabela
                tableResponsive.addEventListener('scroll', function() {
                    indicator.style.opacity = '0';
                });
            }
        } else {
            tableResponsive.classList.remove('needs-scroll');
            const indicator = document.getElementById('scroll-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
    
    // Verificar quando a página carrega e quando redimensiona
    verificarNecessidadeRolagem();
    window.addEventListener('resize', verificarNecessidadeRolagem);
    
    // Verificar novamente quando os usuários forem carregados
    document.addEventListener('usuariosCarregados', verificarNecessidadeRolagem);
}

// Função para inicializar o pull-to-refresh para dispositivos móveis
function inicializarPullToRefresh() {
    // Verificar se estamos em um dispositivo móvel
    if (window.innerWidth > 768) return;
    
    let startY = 0;
    let pullDistance = 0;
    const minPullDistance = 80; // Distância mínima para atualizar
    const maxPullDistance = 120; // Distância máxima para o efeito visual
    let isPulling = false;
    let refreshIndicator = null;
    
    // Criar o indicador de atualização
    function criarIndicadorAtualizacao() {
        if (document.getElementById('pull-to-refresh-indicator')) return;
        
        refreshIndicator = document.createElement('div');
        refreshIndicator.id = 'pull-to-refresh-indicator';
        refreshIndicator.className = 'pull-to-refresh-indicator';
        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Puxe para atualizar';
        document.body.appendChild(refreshIndicator);
        
        return refreshIndicator;
    }
    
    // Obter o elemento da tabela
    const tableContainer = document.querySelector('.card-body');
    if (!tableContainer) return;
    
    // Adicionar eventos de toque
    tableContainer.addEventListener('touchstart', function(e) {
        // Só ativar o pull-to-refresh se estiver no topo da página
        if (window.scrollY > 5) return;
        
        startY = e.touches[0].clientY;
        isPulling = true;
        
        // Criar o indicador se ainda não existir
        if (!refreshIndicator) {
            refreshIndicator = criarIndicadorAtualizacao();
        }
        
        refreshIndicator.style.transform = 'translateY(-100%)';
        refreshIndicator.style.opacity = '0';
    }, { passive: true });
    
    tableContainer.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        // Calcular a distância puxada
        pullDistance = e.touches[0].clientY - startY;
        
        // Só mostrar o indicador se puxar para baixo
        if (pullDistance <= 0) return;
        
        // Limitar a distância máxima
        pullDistance = Math.min(pullDistance, maxPullDistance);
        
        // Atualizar a posição do indicador
        const translateY = (pullDistance / maxPullDistance * 100) - 100;
        const opacity = pullDistance / minPullDistance;
        
        refreshIndicator.style.transform = `translateY(${translateY}%)`;
        refreshIndicator.style.opacity = Math.min(opacity, 1);
        
        // Adicionar classe de rotação se puxar o suficiente
        if (pullDistance >= minPullDistance) {
            refreshIndicator.classList.add('rotating');
        } else {
            refreshIndicator.classList.remove('rotating');
        }
        
        // Prevenir o comportamento padrão se puxar o suficiente
        if (pullDistance > 10 && window.scrollY <= 5) {
            e.preventDefault();
        }
    }, { passive: false });
    
    tableContainer.addEventListener('touchend', function() {
        if (!isPulling) return;
        isPulling = false;
        
        // Se puxou o suficiente, atualizar os dados
        if (pullDistance >= minPullDistance) {
            // Mostrar o indicador completamente
            refreshIndicator.style.transform = 'translateY(0)';
            refreshIndicator.classList.add('rotating');
            
            // Atualizar os dados
            carregarUsuarios().then(() => {
                // Esconder o indicador após a atualização
                setTimeout(() => {
                    refreshIndicator.style.transform = 'translateY(-100%)';
                    refreshIndicator.style.opacity = '0';
                    refreshIndicator.classList.remove('rotating');
                }, 500);
            });
        } else {
            // Se não puxou o suficiente, esconder o indicador
            refreshIndicator.style.transform = 'translateY(-100%)';
            refreshIndicator.style.opacity = '0';
            refreshIndicator.classList.remove('rotating');
        }
        
        pullDistance = 0;
    }, { passive: true });
}