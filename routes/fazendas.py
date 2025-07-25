from flask import Blueprint, render_template, request, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, check_temp_password
from models.fazenda import Fazenda

bp = Blueprint('fazendas', __name__)

@bp.route('/fazendas')
@login_required
@check_temp_password
def fazendas_page():
    return render_template('fazendas.html')

@bp.route('/fazendas/adicionar')
@login_required
@check_temp_password
def adicionar_fazenda():
    """Página para adicionar nova fazenda (em construção)"""
    return render_template('em_construcao.html')

@bp.route('/api/fazendas', methods=['GET'])
@login_required
def get_fazendas():
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Verificar se há um termo de busca
        termo_busca = request.args.get('busca', '')
        
        if termo_busca:
            fazendas = Fazenda.search(termo_busca, limit, offset)
        else:
            fazendas = Fazenda.get_all(limit, offset)
        
        return jsonify({
            "success": True,
            "fazendas": fazendas
        }), 200
    except Exception as e:
        print(f"Erro ao buscar fazendas: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar fazendas"
        }), 500

@bp.route('/api/fazendas/<int:id>', methods=['GET'])
@login_required
def get_fazenda(id):
    try:
        fazenda = Fazenda.get_by_id(id)
        
        if not fazenda:
            return jsonify({
                "success": False,
                "error": "Fazenda não encontrada"
            }), 404
        
        return jsonify({
            "success": True,
            "fazenda": fazenda
        }), 200
    except Exception as e:
        print(f"Erro ao buscar fazenda: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar fazenda"
        }), 500

@bp.route('/api/fazendas', methods=['POST'])
@login_required
def create_fazenda():
    try:
        data = request.json
        
        # Validar dados
        if not data.get('nome'):
            return jsonify({
                "success": False,
                "error": "Nome da fazenda é obrigatório"
            }), 400
        
        if not data.get('municipio'):
            return jsonify({
                "success": False,
                "error": "Município é obrigatório"
            }), 400
        
        if not data.get('estado'):
            return jsonify({
                "success": False,
                "error": "Estado é obrigatório"
            }), 400
        
        # Criar fazenda
        result = Fazenda.create(data)
        
        return jsonify({
            "success": True,
            "message": "Fazenda cadastrada com sucesso",
            "id": result["id"]
        }), 201
    except Exception as e:
        print(f"Erro ao cadastrar fazenda: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao cadastrar fazenda: {str(e)}"
        }), 500

@bp.route('/api/fazendas/<int:id>', methods=['PUT'])
@login_required
def update_fazenda(id):
    try:
        data = request.json
        
        # Verificar se a fazenda existe
        fazenda = Fazenda.get_by_id(id)
        if not fazenda:
            return jsonify({
                "success": False,
                "error": "Fazenda não encontrada"
            }), 404
        
        # Atualizar fazenda
        Fazenda.update(id, data)
        
        return jsonify({
            "success": True,
            "message": "Fazenda atualizada com sucesso"
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar fazenda: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao atualizar fazenda: {str(e)}"
        }), 500

@bp.route('/api/fazendas/<int:id>', methods=['DELETE'])
@login_required
def delete_fazenda(id):
    try:
        # Excluir fazenda
        Fazenda.delete(id)
        
        return jsonify({
            "success": True,
            "message": "Fazenda excluída com sucesso"
        }), 200
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        print(f"Erro ao excluir fazenda: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao excluir fazenda: {str(e)}"
        }), 500

@bp.route('/api/fazendas/ativas', methods=['GET'])
@login_required
def get_fazendas_ativas():
    try:
        fazendas = Fazenda.get_active_fazendas()
        
        return jsonify({
            "success": True,
            "fazendas": fazendas
        }), 200
    except Exception as e:
        print(f"Erro ao buscar fazendas ativas: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar fazendas ativas"
        }), 500

@bp.route('/api/fazendas/estatisticas', methods=['GET'])
@login_required
def get_estatisticas_fazendas():
    try:
        estatisticas = Fazenda.count_animais_por_fazenda()
        
        return jsonify({
            "success": True,
            "estatisticas": estatisticas
        }), 200
    except Exception as e:
        print(f"Erro ao buscar estatísticas de fazendas: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar estatísticas de fazendas"
        }), 500