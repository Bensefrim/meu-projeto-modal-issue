from flask import Blueprint, render_template, request, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, check_temp_password
from models.animal import Animal

bp = Blueprint('animais', __name__)

@bp.route('/animais')
@login_required
@check_temp_password
def animais_page():
    return render_template('animais.html')

@bp.route('/api/animais', methods=['GET'])
@login_required
def get_animais():
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Verificar se há um termo de busca
        termo_busca = request.args.get('busca', '')
        
        if termo_busca:
            animais = Animal.search(termo_busca, limit, offset)
        else:
            animais = Animal.get_all(limit, offset)
        
        return jsonify({
            "success": True,
            "animais": animais
        }), 200
    except Exception as e:
        print(f"Erro ao buscar animais: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar animais"
        }), 500

@bp.route('/api/animais/<int:id>', methods=['GET'])
@login_required
def get_animal(id):
    try:
        animal = Animal.get_by_id(id)
        
        if not animal:
            return jsonify({
                "success": False,
                "error": "Animal não encontrado"
            }), 404
        
        return jsonify({
            "success": True,
            "animal": animal
        }), 200
    except Exception as e:
        print(f"Erro ao buscar animal: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar animal"
        }), 500

@bp.route('/api/animais', methods=['POST'])
@login_required
def create_animal():
    try:
        data = request.json
        
        # Validar dados
        if not data.get('codigo'):
            return jsonify({
                "success": False,
                "error": "Código do animal é obrigatório"
            }), 400
        
        if not data.get('tipo'):
            return jsonify({
                "success": False,
                "error": "Tipo do animal é obrigatório"
            }), 400
        
        # Criar animal
        result = Animal.create(data)
        
        return jsonify({
            "success": True,
            "message": "Animal cadastrado com sucesso",
            "id": result["id"]
        }), 201
    except Exception as e:
        print(f"Erro ao cadastrar animal: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao cadastrar animal: {str(e)}"
        }), 500

@bp.route('/api/animais/<int:id>', methods=['PUT'])
@login_required
def update_animal(id):
    try:
        data = request.json
        
        # Verificar se o animal existe
        animal = Animal.get_by_id(id)
        if not animal:
            return jsonify({
                "success": False,
                "error": "Animal não encontrado"
            }), 404
        
        # Atualizar animal
        Animal.update(id, data)
        
        return jsonify({
            "success": True,
            "message": "Animal atualizado com sucesso"
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar animal: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao atualizar animal: {str(e)}"
        }), 500

@bp.route('/api/animais/<int:id>', methods=['DELETE'])
@login_required
def delete_animal(id):
    try:
        # Excluir animal
        Animal.delete(id)
        
        return jsonify({
            "success": True,
            "message": "Animal excluído com sucesso"
        }), 200
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 404
    except Exception as e:
        print(f"Erro ao excluir animal: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao excluir animal: {str(e)}"
        }), 500