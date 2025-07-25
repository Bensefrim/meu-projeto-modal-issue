from flask import Blueprint, render_template, request, jsonify, session
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import login_required, admin_required, check_temp_password
from models.usuario import Usuario

bp = Blueprint('usuarios', __name__)

@bp.route('/usuarios')
@login_required
@check_temp_password
@admin_required
def usuarios_page():
    return render_template('usuarios.html')

@bp.route('/perfil')
@login_required
@check_temp_password
def perfil_page():
    return render_template('perfil.html')

@bp.route('/api/usuarios', methods=['GET'])
@login_required
@admin_required
def get_usuarios():
    try:
        usuarios = Usuario.get_all()
        return jsonify({
            "success": True,
            "usuarios": usuarios
        }), 200
    except Exception as e:
        print(f"Erro ao buscar usuários: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar usuários"
        }), 500

@bp.route('/api/usuarios/<int:id>', methods=['GET'])
@login_required
def get_usuario(id):
    try:
        # Verificar se o usuário está tentando acessar seu próprio perfil ou é admin
        if session.get('user_id') != id and session.get('user_type') != 'admin':
            return jsonify({
                "success": False,
                "error": "Acesso não autorizado"
            }), 403
        
        usuario = Usuario.get_by_id(id)
        return jsonify({
            "success": True,
            "usuario": usuario
        }), 200
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 404
    except Exception as e:
        print(f"Erro ao buscar usuário: {e}")
        return jsonify({
            "success": False,
            "error": "Erro ao buscar usuário"
        }), 500

@bp.route('/api/usuarios', methods=['POST'])
@login_required
@admin_required
def create_usuario():
    try:
        data = request.json
        
        # Validar dados
        if not data.get('nome'):
            return jsonify({
                "success": False,
                "error": "Nome é obrigatório"
            }), 400
        
        if not data.get('email'):
            return jsonify({
                "success": False,
                "error": "Email é obrigatório"
            }), 400
        
        if not data.get('senha'):
            return jsonify({
                "success": False,
                "error": "Senha é obrigatória"
            }), 400
        
        if not data.get('tipo_usuario'):
            return jsonify({
                "success": False,
                "error": "Tipo de usuário é obrigatório"
            }), 400
        
        # Criar usuário
        result = Usuario.create(data)
        
        return jsonify({
            "success": True,
            "message": "Usuário cadastrado com sucesso",
            "id": result["id"]
        }), 201
    except Exception as e:
        print(f"Erro ao cadastrar usuário: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao cadastrar usuário: {str(e)}"
        }), 500

@bp.route('/api/usuarios/<int:id>', methods=['PUT'])
@login_required
def update_usuario(id):
    try:
        data = request.json
        
        # Verificar se o usuário está tentando atualizar seu próprio perfil ou é admin
        if session.get('user_id') != id and session.get('user_type') != 'admin':
            return jsonify({
                "success": False,
                "error": "Acesso não autorizado"
            }), 403
        
        # Se não for admin, não pode alterar o tipo de usuário
        if session.get('user_type') != 'admin' and 'tipo_usuario' in data:
            return jsonify({
                "success": False,
                "error": "Você não tem permissão para alterar o tipo de usuário"
            }), 403
        
        # Atualizar usuário
        Usuario.update(id, data)
        
        return jsonify({
            "success": True,
            "message": "Usuário atualizado com sucesso"
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar usuário: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao atualizar usuário: {str(e)}"
        }), 500

@bp.route('/api/usuarios/<int:id>', methods=['DELETE'])
@login_required
@admin_required
def delete_usuario(id):
    try:
        # Não permitir que o usuário exclua a si mesmo
        if session.get('user_id') == id:
            return jsonify({
                "success": False,
                "error": "Você não pode excluir seu próprio usuário"
            }), 400
        
        # Excluir usuário
        Usuario.delete(id)
        
        return jsonify({
            "success": True,
            "message": "Usuário excluído com sucesso"
        }), 200
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        print(f"Erro ao excluir usuário: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao excluir usuário: {str(e)}"
        }), 500