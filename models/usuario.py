import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.database import get_db_connection
from extensions import bcrypt

class Usuario:
    @staticmethod
    def get_all():
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, nome, email, tipo_usuario, ultimo_login FROM usuarios")
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def get_by_id(id):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, nome, email, tipo_usuario 
                FROM usuarios 
                WHERE id = %s
            """, (id,))
            usuario = cursor.fetchone()
            if not usuario:
                raise ValueError("Usuário não encontrado")
            return usuario
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def create(data):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            hashed_password = bcrypt.generate_password_hash(data['senha']).decode('utf-8')
            
            cursor.execute("""
                INSERT INTO usuarios (nome, email, senha, tipo_usuario, senha_temporaria)
                VALUES (%s, %s, %s, %s, TRUE)
            """, (data['nome'], data['email'], hashed_password, data['tipo_usuario']))
            
            novo_id = cursor.lastrowid
            conn.commit()
            
            return {"id": novo_id}
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def update(id, data):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Construir a query de atualização dinamicamente
            update_fields = []
            params = []
            
            if 'nome' in data:
                update_fields.append("nome = %s")
                params.append(data['nome'])
            if 'email' in data:
                update_fields.append("email = %s")
                params.append(data['email'])
            if 'tipo_usuario' in data:
                update_fields.append("tipo_usuario = %s")
                params.append(data['tipo_usuario'])
            if 'senha' in data and data['senha']:
                update_fields.append("senha = %s")
                hashed_password = bcrypt.generate_password_hash(data['senha']).decode('utf-8')
                params.append(hashed_password)
                # Se a senha foi alterada, definir senha_temporaria como TRUE
                update_fields.append("senha_temporaria = TRUE")

            if not update_fields:
                return

            params.append(id)  # para o WHERE id = %s
            
            query = "UPDATE usuarios SET " + ", ".join(update_fields) + " WHERE id = %s"
            cursor.execute(query, tuple(params))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def delete(id):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Primeiro, verificar se o usuário existe
            cursor.execute("SELECT tipo_usuario FROM usuarios WHERE id = %s", (id,))
            usuario = cursor.fetchone()
            
            if not usuario:
                raise ValueError("Usuário não encontrado")

            # Verificar se não é o último usuário admin
            cursor.execute("SELECT COUNT(*) as total FROM usuarios WHERE tipo_usuario = 'admin'", ())
            total_admins = cursor.fetchone()['total']
            
            if total_admins <= 1 and usuario['tipo_usuario'] == 'admin':
                raise ValueError("Não é possível excluir o último usuário administrador")

            # Se passou por todas as verificações, excluir o usuário
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
            conn.commit()
            
            return True

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()