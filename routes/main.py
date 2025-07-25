from flask import Blueprint, render_template, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, check_temp_password
from models.animal import Animal

bp = Blueprint('main', __name__)

@bp.route('/dashboard')
@login_required
@check_temp_password
def dashboard():
    return render_template('dashboard.html')

@bp.route('/api/dashboard/stats')
@login_required
def dashboard_stats():
    try:
        # Obter estatísticas para o dashboard
        stats = {}
        
        # Total de animais por tipo
        stats['animais_por_tipo'] = Animal.count_by_tipo()
        
        # Adicionar outras estatísticas conforme necessário
        
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
    except Exception as e:
        print(f"Erro ao obter estatísticas: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao obter estatísticas"
        }), 500

@bp.route('/movimentacoes')
@login_required
@check_temp_password
def movimentacoes():
    """Página de movimentações (em construção)"""
    return render_template('em_construcao.html')

@bp.route('/perfil')
@login_required
@check_temp_password
def perfil():
    """Página de perfil do usuário (em construção)"""
    return render_template('em_construcao.html')

@bp.route('/pwa-test')
def pwa_test():
    """Página de teste para o Progressive Web App (PWA)"""
    return render_template('pwa_test.html')