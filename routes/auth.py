from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import bcrypt
from utils.database import get_db_connection
from utils.date_utils import get_current_time_gmt4
from functools import wraps

bp = Blueprint('auth', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login_page'))

@bp.route('/login', methods=['GET'])
def login_page():
    print("Recebida requisição GET para /login")
    if 'user_id' in session:
        print("Usuário já está logado, redirecionando para dashboard")
        return redirect(url_for('main.dashboard'))
    print("Renderizando página de login")
    return render_template('login.html')

@bp.route('/login', methods=['POST'])
def login():
    print("Recebida requisição POST para /login")
    
    # Verificar o tipo de conteúdo
    content_type = request.headers.get('Content-Type', '')
    print(f"Content-Type: {content_type}")
    
    # Verificar se é JSON
    if not request.is_json:
        print(f"Requisição não é JSON. Dados: {request.data}")
        return jsonify({"error": "Requisição deve ser JSON"}), 400
    
    data = request.json
    print(f"Dados recebidos: {data}")
    
    email = data.get('email')
    senha = data.get('senha')
    
    if not email or not senha:
        print("Email ou senha não fornecidos")
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    try:
        print(f"Tentando conectar ao banco de dados para verificar usuário: {email}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"Usuário não encontrado: {email}")
            return jsonify({"error": "Credenciais inválidas"}), 401
            
        print(f"Usuário encontrado: {user['nome']}")
        
        # Verificar se a senha está em hash ou não
        senha_correta = False
        try:
            senha_correta = bcrypt.check_password_hash(user['senha'], senha)
        except ValueError:
            # Se a senha não estiver em hash, comparar diretamente (para o usuário inicial)
            senha_correta = user['senha'] == senha
            if senha_correta:
                print("Senha não está em hash, mas está correta. Atualizando para hash.")
                hashed_password = bcrypt.generate_password_hash(senha).decode('utf-8')
                cursor.execute("UPDATE usuarios SET senha = %s WHERE id = %s",
                             (hashed_password, user['id']))
                conn.commit()
        
        if senha_correta:
            print("Senha correta, criando sessão")
            session['user_id'] = user['id']
            session['user_type'] = user['tipo_usuario']
            session['senha_temporaria'] = user['senha_temporaria']
            
            current_time = get_current_time_gmt4()
            cursor.execute("UPDATE usuarios SET ultimo_login = %s WHERE id = %s",
                         (current_time, user['id']))
            conn.commit()

            return jsonify({
                "message": "Login successful",
                "user_type": user['tipo_usuario'],
                "senha_temporaria": user['senha_temporaria']
            }), 200
        else:
            print("Senha incorreta")
            return jsonify({"error": "Credenciais inválidas"}), 401

    except Exception as e:
        print(f"Erro ao fazer login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro ao fazer login: {str(e)}"}), 500

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()
            
@bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout bem-sucedido."}), 200

@bp.route('/check_login')
def check_login():
    return jsonify({
        "logged_in": 'user_id' in session,
        "user_type": session.get('user_type', ''),
        "senha_temporaria": session.get('senha_temporaria', False)
    }), 200

@bp.route('/check_temp_password')
@login_required
def check_temp_password():
    return jsonify({
        "senha_temporaria": session.get('senha_temporaria', False)
    })
                        
@bp.route('/api/alterar_senha', methods=['POST'])
@login_required
def alterar_senha():
    if 'user_id' not in session:
        return jsonify({"error": "Usuário não autenticado"}), 401

    data = request.json
    nova_senha = data.get('nova_senha')
    senha_atual = data.get('senha_atual')
    is_senha_temporaria = data.get('is_senha_temporaria', False)

    if not nova_senha:
        return jsonify({"error": "Nova senha é obrigatória"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Buscar dados do usuário
        cursor.execute("SELECT senha, senha_temporaria FROM usuarios WHERE id = %s", (session['user_id'],))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Se não for senha temporária, verificar senha atual
        if not is_senha_temporaria:
            if not senha_atual:
                return jsonify({"error": "Senha atual é obrigatória"}), 400
            
            if not bcrypt.check_password_hash(usuario['senha'], senha_atual):
                return jsonify({"error": "Senha atual incorreta"}), 400

        # Criptografar e salvar nova senha
        hashed_password = bcrypt.generate_password_hash(nova_senha).decode('utf-8')
        
        cursor.execute("""
            UPDATE usuarios 
            SET senha = %s, 
                senha_temporaria = FALSE
            WHERE id = %s
        """, (hashed_password, session['user_id']))
        
        conn.commit()
        session['senha_temporaria'] = False
        return jsonify({"message": "Senha alterada com sucesso"}), 200

    except Exception as e:
        print(f"Erro ao alterar senha: {e}")
        conn.rollback()
        return jsonify({"error": "Erro ao alterar senha"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@bp.route('/alterar-senha')
def alterar_senha_page():
    is_temp = request.args.get('temp') == 'true'
    return render_template('partials/alterar_senha.html', is_temp_password=is_temp)

@bp.route('/check_access')
@login_required
def check_access():
    if session.get('senha_temporaria'):
        return jsonify({"error": "É necessário alterar a senha temporária"}), 403
    return jsonify({"message": "Acesso permitido"}), 200