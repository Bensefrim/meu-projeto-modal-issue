from flask import session, jsonify, request, redirect, url_for
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Verificar se a requisição espera JSON ou HTML
            if request.path.startswith('/api/') or request.is_xhr or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"error": "Não autorizado", "redirect": "/login"}), 401
            else:
                return redirect(url_for('auth.login_page'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401
        if session.get('user_type') != 'admin':
            return jsonify({"error": "Acesso restrito a administradores"}), 403
        return f(*args, **kwargs)
    return decorated_function

def check_temp_password(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('senha_temporaria'):
            return jsonify({"error": "É necessário alterar a senha temporária"}), 403
        return f(*args, **kwargs)
    return decorated_function