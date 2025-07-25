from flask import Blueprint, render_template, request, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, admin_required, check_temp_password
from utils.database import get_db_connection

bp = Blueprint('admin', __name__)

@bp.route('/')
@login_required
@check_temp_password
@admin_required
def admin_page():
    return render_template('admin.html')

@bp.route('/api/system/info', methods=['GET'])
@login_required
@admin_required
def system_info():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obter informações do sistema
        info = {}
        
        # Total de usuários
        cursor.execute("SELECT COUNT(*) as total FROM usuarios")
        info['total_usuarios'] = cursor.fetchone()['total']
        
        # Total de animais
        cursor.execute("SELECT COUNT(*) as total FROM animais")
        info['total_animais'] = cursor.fetchone()['total']
        
        # Usuários por tipo
        cursor.execute("""
            SELECT tipo_usuario, COUNT(*) as total 
            FROM usuarios 
            GROUP BY tipo_usuario
        """)
        info['usuarios_por_tipo'] = cursor.fetchall()
        
        # Último login
        cursor.execute("""
            SELECT nome, ultimo_login 
            FROM usuarios 
            ORDER BY ultimo_login DESC 
            LIMIT 5
        """)
        info['ultimos_logins'] = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "info": info
        }), 200
    except Exception as e:
        print(f"Erro ao obter informações do sistema: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao obter informações do sistema"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@bp.route('/api/system/backup', methods=['POST'])
@login_required
@admin_required
def create_backup():
    # Esta função seria implementada para criar um backup do banco de dados
    # Como é apenas um exemplo, retornaremos uma mensagem de sucesso
    return jsonify({
        "success": True,
        "message": "Backup criado com sucesso"
    }), 200

@bp.route('/api/system/logs', methods=['GET'])
@login_required
@admin_required
def get_logs():
    try:
        # Esta função seria implementada para obter logs do sistema
        # Como é apenas um exemplo, retornaremos dados fictícios
        logs = [
            {"timestamp": "2025-06-27 08:00:00", "level": "INFO", "message": "Sistema iniciado"},
            {"timestamp": "2025-06-27 08:01:00", "level": "INFO", "message": "Usuário logado"},
            {"timestamp": "2025-06-27 08:02:00", "level": "WARNING", "message": "Tentativa de acesso não autorizado"}
        ]
        
        return jsonify({
            "success": True,
            "logs": logs
        }), 200
    except Exception as e:
        print(f"Erro ao obter logs: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao obter logs"
        }), 500