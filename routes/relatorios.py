from flask import Blueprint, render_template, request, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, check_temp_password
from models.animal import Animal
from utils.database import get_db_connection

bp = Blueprint('relatorios', __name__)

@bp.route('/relatorios')
@login_required
@check_temp_password
def relatorios_page():
    # Usar a página em construção até que a página de relatórios seja implementada
    return render_template('em_construcao.html')

@bp.route('/api/relatorios/animais_por_tipo', methods=['GET'])
@login_required
def relatorio_animais_por_tipo():
    try:
        dados = Animal.count_by_tipo()
        
        return jsonify({
            "success": True,
            "dados": dados
        }), 200
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao gerar relatório"
        }), 500

@bp.route('/api/relatorios/animais_por_status', methods=['GET'])
@login_required
def relatorio_animais_por_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT status, COUNT(*) as total
            FROM animais
            GROUP BY status
            ORDER BY total DESC
        """
        
        cursor.execute(query)
        dados = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "dados": dados
        }), 200
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao gerar relatório"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@bp.route('/api/relatorios/animais_por_raca', methods=['GET'])
@login_required
def relatorio_animais_por_raca():
    try:
        tipo = request.args.get('tipo', '')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if tipo:
            query = """
                SELECT raca, COUNT(*) as total
                FROM animais
                WHERE tipo = %s
                GROUP BY raca
                ORDER BY total DESC
            """
            cursor.execute(query, (tipo,))
        else:
            query = """
                SELECT raca, COUNT(*) as total
                FROM animais
                GROUP BY raca
                ORDER BY total DESC
            """
            cursor.execute(query)
            
        dados = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "dados": dados
        }), 200
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao gerar relatório"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@bp.route('/api/relatorios/peso_medio_por_tipo', methods=['GET'])
@login_required
def relatorio_peso_medio_por_tipo():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT tipo, AVG(peso) as peso_medio
            FROM animais
            GROUP BY tipo
            ORDER BY peso_medio DESC
        """
        
        cursor.execute(query)
        dados = cursor.fetchall()
        
        # Formatar o peso médio para 2 casas decimais
        for item in dados:
            if item['peso_medio'] is not None:
                item['peso_medio'] = round(float(item['peso_medio']), 2)
        
        return jsonify({
            "success": True,
            "dados": dados
        }), 200
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao gerar relatório"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()