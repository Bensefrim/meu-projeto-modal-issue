// Funções para autenticação

// Função para realizar login
async function login(email, senha) {
    try {
        console.log('Tentando fazer login com:', { email });
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        console.log('Status da resposta:', response.status);
        
        // Se a resposta não for JSON, mostrar o texto
        if (!response.headers.get('content-type')?.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não é JSON:', text);
            throw new Error('Resposta do servidor não é JSON válido');
        }

        const data = await response.json();
        console.log('Dados da resposta:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }

        // Verificar se o usuário precisa alterar a senha temporária
        if (data.senha_temporaria) {
            window.location.href = '/alterar-senha?temp=true';
        } else {
            window.location.href = '/dashboard';
        }

        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('error', error.message);
        throw error;
    }
}

// Função para realizar logout
async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer logout');
        }

        window.location.href = '/';
        return data;
    } catch (error) {
        console.error('Erro no logout:', error);
        showAlert('error', error.message);
        throw error;
    }
}

// Função para verificar se o usuário está logado
async function checkLogin() {
    try {
        const response = await fetch('/check_login');
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        return { logged_in: false };
    }
}

// Função para alterar senha
async function alterarSenha(senhaAtual, novaSenha, isSenhaTemporaria = false) {
    try {
        const response = await fetch('/api/alterar_senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senha_atual: senhaAtual,
                nova_senha: novaSenha,
                is_senha_temporaria: isSenhaTemporaria
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao alterar senha');
        }

        showAlert('success', 'Senha alterada com sucesso');
        
        // Redirecionar para o dashboard após alterar a senha
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);

        return data;
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showAlert('error', error.message);
        throw error;
    }
}

// Função para verificar se o usuário precisa alterar a senha temporária
async function checkTempPassword() {
    try {
        // Verificar se já estamos na página de alteração de senha
        if (window.location.pathname === '/alterar-senha') {
            console.log('Já estamos na página de alteração de senha, não redirecionando');
            return { senha_temporaria: true };
        }
        
        const response = await fetch('/check_temp_password');
        const data = await response.json();

        if (data.senha_temporaria) {
            window.location.href = '/alterar-senha?temp=true';
        }

        return data;
    } catch (error) {
        console.error('Erro ao verificar senha temporária:', error);
        return { senha_temporaria: false };
    }
}

// Função para verificar acesso
async function checkAccess() {
    try {
        // Verificar se já estamos na página de alteração de senha
        if (window.location.pathname === '/alterar-senha') {
            console.log('Já estamos na página de alteração de senha, não redirecionando');
            return false;
        }
        
        const response = await fetch('/check_access');
        
        if (response.status === 403) {
            const data = await response.json();
            if (data.error.includes('senha temporária')) {
                window.location.href = '/alterar-senha?temp=true';
            }
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        return false;
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

// Inicializar eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const loginStatus = document.getElementById('login-status');
            
            if (loginStatus) {
                loginStatus.textContent = "Tentando fazer login...";
                loginStatus.style.color = "blue";
            }
            
            try {
                await login(email, senha);
                if (loginStatus) {
                    loginStatus.textContent = "Login bem-sucedido! Redirecionando...";
                    loginStatus.style.color = "green";
                }
            } catch (error) {
                // Erro já tratado na função login
                if (loginStatus) {
                    loginStatus.textContent = `Erro: ${error.message}`;
                    loginStatus.style.color = "red";
                }
            }
        });
    }

    // Botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                await logout();
            } catch (error) {
                // Erro já tratado na função logout
            }
        });
    }

    // Formulário de alteração de senha
    const alterarSenhaForm = document.getElementById('alterar-senha-form');
    if (alterarSenhaForm) {
        alterarSenhaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const senhaAtual = document.getElementById('senha-atual')?.value || '';
            const novaSenha = document.getElementById('nova-senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;
            
            // Verificar se as senhas coincidem
            if (novaSenha !== confirmarSenha) {
                showAlert('error', 'As senhas não coincidem');
                return;
            }
            
            // Verificar se é alteração de senha temporária
            const urlParams = new URLSearchParams(window.location.search);
            const isTemp = urlParams.get('temp') === 'true';
            
            try {
                await alterarSenha(senhaAtual, novaSenha, isTemp);
            } catch (error) {
                // Erro já tratado na função alterarSenha
            }
        });
    }

    // Verificar se o usuário precisa alterar a senha temporária
    checkTempPassword().catch(console.error);
});