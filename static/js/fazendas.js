// Variáveis globais
let fazendaIdParaExcluir = null;
let fazendaModal = null;
let confirmDeleteModal = null;
let detalhesFazendaModal = null; // Declare globalmente

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modais
    fazendaModal = new bootstrap.Modal(document.getElementById('fazendaModal'));
    confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    detalhesFazendaModal = new bootstrap.Modal(document.getElementById('detalhesFazendaModal')); // Instancie aqui
    
    // Inicializar máscaras
    if ($.fn.mask) {
        $('#fazenda-telefone').mask('(00) 00000-0000');
    }
    
    // Carregar fazendas
    carregarFazendas();
    
    // Adicionar evento de busca ao pressionar Enter
    document.getElementById('busca-fazenda').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarFazendas();
        }
    });
    
    // Inicializar indicador de rolagem para tabelas responsivas
    inicializarIndicadorRolagem();
    
    // Reativado com tratamento de autenticação
    inicializarPullToRefresh();
});

// Função para carregar todas as fazendas
async function carregarFazendas() {
    try {
        mostrarLoading(true);
        
        const response = await fetch('/api/fazendas');
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderizarFazendas(data.fazendas);
        } else {
            showAlert('error', data.error || 'Erro ao carregar fazendas');
        }
    } catch (error) {
        console.error('Erro ao carregar fazendas:', error);
        showAlert('error', 'Erro ao carregar fazendas');
    } finally {
        mostrarLoading(false);
    }
}

// Função para buscar fazendas
function buscarFazendas() {
    const termoBusca = document.getElementById('busca-fazenda').value.trim();
    
    if (termoBusca === '') {
        carregarFazendas();
        return;
    }
    
    buscarFazendasPorTermo(termoBusca);
}

// Função para buscar fazendas por termo
async function buscarFazendasPorTermo(termo) {
    try {
        mostrarLoading(true);
        
        const response = await fetch(`/api/fazendas?busca=${encodeURIComponent(termo)}`);
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderizarFazendas(data.fazendas);
        } else {
            showAlert('error', data.error || 'Erro ao buscar fazendas');
        }
    } catch (error) {
        console.error('Erro ao buscar fazendas:', error);
        showAlert('error', 'Erro ao buscar fazendas');
    } finally {
        mostrarLoading(false);
    }
}

// Função para renderizar fazendas na tabela
function renderizarFazendas(fazendas) {
    const tableBody = document.getElementById('fazendas-table-body');
    const emptyMessage = document.getElementById('fazendas-empty');
    
    tableBody.innerHTML = '';
    
    if (fazendas.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }
    
    emptyMessage.style.display = 'none';
    
    fazendas.forEach(fazenda => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${fazenda.nome}</td>
            <td>${fazenda.municipio}</td>
            <td class="hide-xs">${fazenda.estado}</td>
            <td class="hide-xs">${fazenda.area_total ? fazenda.area_total : '-'}</td>
            <td class="hide-xs">${fazenda.responsavel ? fazenda.responsavel : '-'}</td>
            <td>${fazenda.ativo ? '<span class="badge bg-success">Ativo</span>' : '<span class="badge bg-danger">Inativo</span>'}</td>
            <td>
                <div class="d-flex flex-column flex-sm-row">
                    <button class="btn btn-sm btn-info mb-1 mb-sm-0 me-sm-1" onclick="editarFazenda(${fazenda.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1 mb-sm-0 me-sm-1" onclick="excluirFazenda(${fazenda.id}, '${fazenda.nome}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary d-inline-block d-sm-none" onclick="mostrarDetalhesFazenda(${fazenda.id})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Disparar evento personalizado para indicar que as fazendas foram carregadas
    document.dispatchEvent(new CustomEvent('fazendasCarregadas'));
}

// Função para mostrar/esconder o loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('fazendas-loading');
    loading.style.display = mostrar ? 'block' : 'none';
}

// Função para mostrar o modal de cadastro de fazenda
function showFazendaModal() {
    // Limpar o formulário
    document.getElementById('fazenda-form').reset();
    document.getElementById('fazenda-id').value = '';
    document.getElementById('fazendaModalLabel').textContent = 'Nova Fazenda';
    
    // Mostrar o modal
    fazendaModal.show();
}

// Função para editar uma fazenda
async function editarFazenda(id) {
    try {
        const response = await fetch(`/api/fazendas/${id}`);
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            const fazenda = data.fazenda;
            
            // Preencher o formulário
            document.getElementById('fazenda-id').value = fazenda.id;
            document.getElementById('fazenda-nome').value = fazenda.nome || '';
            document.getElementById('fazenda-endereco').value = fazenda.endereco || '';
            document.getElementById('fazenda-municipio').value = fazenda.municipio || '';
            document.getElementById('fazenda-estado').value = fazenda.estado || '';
            document.getElementById('fazenda-area-total').value = fazenda.area_total || '';
            document.getElementById('fazenda-area-pastagem').value = fazenda.area_pastagem || '';
            document.getElementById('fazenda-capacidade-ua').value = fazenda.capacidade_ua || '';
            document.getElementById('fazenda-responsavel').value = fazenda.responsavel || '';
            document.getElementById('fazenda-telefone').value = fazenda.telefone || '';
            document.getElementById('fazenda-email').value = fazenda.email || '';
            document.getElementById('fazenda-observacoes').value = fazenda.observacoes || '';
            document.getElementById('fazenda-ativo').checked = fazenda.ativo;
            
            // Atualizar o título do modal
            document.getElementById('fazendaModalLabel').textContent = 'Editar Fazenda';
            
            // Mostrar o modal
            fazendaModal.show();
        } else {
            showAlert('error', data.error || 'Erro ao carregar dados da fazenda');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da fazenda:', error);
        showAlert('error', 'Erro ao carregar dados da fazenda');
    }
}

// Função para salvar uma fazenda (criar ou atualizar)
async function salvarFazenda() {
    // Validar o formulário
    const form = document.getElementById('fazenda-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Obter os dados do formulário
    const id = document.getElementById('fazenda-id').value;
    const fazenda = {
        nome: document.getElementById('fazenda-nome').value,
        endereco: document.getElementById('fazenda-endereco').value,
        municipio: document.getElementById('fazenda-municipio').value,
        estado: document.getElementById('fazenda-estado').value,
        area_total: document.getElementById('fazenda-area-total').value || null,
        area_pastagem: document.getElementById('fazenda-area-pastagem').value || null,
        capacidade_ua: document.getElementById('fazenda-capacidade-ua').value || null,
        responsavel: document.getElementById('fazenda-responsavel').value,
        telefone: document.getElementById('fazenda-telefone').value,
        email: document.getElementById('fazenda-email').value,
        observacoes: document.getElementById('fazenda-observacoes').value,
        ativo: document.getElementById('fazenda-ativo').checked
    };
    
    try {
        let url = '/api/fazendas';
        let method = 'POST';
        
        if (id) {
            url = `/api/fazendas/${id}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(fazenda)
        });
        
        if (response.status === 401) {
            // Redirecionar para a página de login se não estiver autenticado
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('success', data.message || 'Fazenda salva com sucesso');
            fazendaModal.hide();
            carregarFazendas();
        } else {
            showAlert('error', data.error || 'Erro ao salvar fazenda');
        }
    } catch (error) {
        console.error('Erro ao salvar fazenda:', error);
        showAlert('error', 'Erro ao salvar fazenda');
    }
}

// Função para mostrar o modal de confirmação de exclusão
function excluirFazenda(id, nome) {
    fazendaIdParaExcluir = id;
    document.getElementById('delete-fazenda-nome').textContent = nome;
    confirmDeleteModal.show();
}

// Função para confirmar a exclusão de uma fazenda
async function confirmarExclusaoFazenda() {
    if (!fazendaIdParaExcluir) return;
    
    try {
        const response = await fetch(`/api/fazendas/${fazendaIdParaExcluir}`, {
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
            showAlert('success', data.message || 'Fazenda excluída com sucesso');
            confirmDeleteModal.hide();
            carregarFazendas();
        } else {
            showAlert('error', data.error || 'Erro ao excluir fazenda');
        }
    } catch (error) {
        console.error('Erro ao excluir fazenda:', error);
        showAlert('error', 'Erro ao excluir fazenda');
    } finally {
        fazendaIdParaExcluir = null;
    }
}

// Função para mostrar detalhes da fazenda em um modal (para dispositivos móveis)
async function mostrarDetalhesFazenda(id) {
    try {
        const response = await fetch(`/api/fazendas/${id}`, {
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
            const fazenda = data.fazenda;
            
            // Armazenar o ID da fazenda para uso posterior
            document.getElementById('detalhesFazendaModal').setAttribute('data-fazenda-id', fazenda.id);
            
            // Preencher o modal de detalhes
            document.getElementById('detalhe-fazenda-nome').textContent = fazenda.nome || '-';
            document.getElementById('detalhe-fazenda-municipio').textContent = fazenda.municipio || '-';
            document.getElementById('detalhe-fazenda-estado').textContent = fazenda.estado || '-';
            document.getElementById('detalhe-fazenda-endereco').textContent = fazenda.endereco || '-';
            document.getElementById('detalhe-fazenda-area-total').textContent = fazenda.area_total ? `${fazenda.area_total} ha` : '-';
            document.getElementById('detalhe-fazenda-area-pastagem').textContent = fazenda.area_pastagem ? `${fazenda.area_pastagem} ha` : '-';
            document.getElementById('detalhe-fazenda-capacidade-ua').textContent = fazenda.capacidade_ua || '-';
            document.getElementById('detalhe-fazenda-responsavel').textContent = fazenda.responsavel || '-';
            document.getElementById('detalhe-fazenda-telefone').textContent = fazenda.telefone || '-';
            document.getElementById('detalhe-fazenda-email').textContent = fazenda.email || '-';
            document.getElementById('detalhe-fazenda-observacoes').textContent = fazenda.observacoes || '-';
            document.getElementById('detalhe-fazenda-status').innerHTML = fazenda.ativo ?
                '<span class="badge bg-success">Ativo</span>' :
                '<span class="badge bg-danger">Inativo</span>';
            
            // Mostrar o modal usando a instância já criada
            detalhesFazendaModal.show();
        } else {
            showAlert('error', data.error || 'Erro ao carregar dados da fazenda');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da fazenda:', error);
        showAlert('error', 'Erro ao carregar dados da fazenda');
    }
}

// Função para editar a fazenda a partir do modal de detalhes
function editarFazendaDoModal() {
    const modal = document.getElementById('detalhesFazendaModal');
    const fazendaId = modal.getAttribute('data-fazenda-id');
    
    // Fechar o modal de detalhes usando a variável global
    detalhesFazendaModal.hide();
    
    // Abrir o modal de edição
    if (fazendaId) {
        editarFazenda(parseInt(fazendaId));
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
    
    // Verificar novamente quando as fazendas forem carregadas
    document.addEventListener('fazendasCarregadas', verificarNecessidadeRolagem);
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
            carregarFazendas().then(() => {
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