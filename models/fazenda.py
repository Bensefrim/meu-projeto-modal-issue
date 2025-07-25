from utils.database import get_db_connection
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Fazenda:
    @staticmethod
    def get_all(limit=100, offset=0):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT id, nome, endereco, municipio, estado, area_total, area_pastagem, 
                       capacidade_ua, responsavel, telefone, email, observacoes, ativo
                FROM fazendas
                ORDER BY nome
                LIMIT %s OFFSET %s
            """
            
            cursor.execute(query, (limit, offset))
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
            
            query = """
                SELECT id, nome, endereco, municipio, estado, area_total, area_pastagem, 
                       capacidade_ua, responsavel, telefone, email, observacoes, ativo
                FROM fazendas
                WHERE id = %s
            """
            
            cursor.execute(query, (id,))
            return cursor.fetchone()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def search(termo_busca, limit=100, offset=0):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Preparar o termo de busca para LIKE
            search_term = f"%{termo_busca}%"
            
            query = """
                SELECT id, nome, endereco, municipio, estado, area_total, area_pastagem, 
                       capacidade_ua, responsavel, telefone, email, observacoes, ativo
                FROM fazendas
                WHERE 
                    nome LIKE %s OR
                    municipio LIKE %s OR
                    estado LIKE %s OR
                    responsavel LIKE %s
                ORDER BY nome
                LIMIT %s OFFSET %s
            """
            
            params = (search_term, search_term, search_term, search_term, limit, offset)
            cursor.execute(query, params)
            
            return cursor.fetchall()
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
            
            query = """
                INSERT INTO fazendas (
                    nome, endereco, municipio, estado, area_total, area_pastagem, 
                    capacidade_ua, responsavel, telefone, email, observacoes, ativo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            params = (
                data.get('nome'),
                data.get('endereco'),
                data.get('municipio'),
                data.get('estado'),
                data.get('area_total'),
                data.get('area_pastagem'),
                data.get('capacidade_ua'),
                data.get('responsavel'),
                data.get('telefone'),
                data.get('email'),
                data.get('observacoes'),
                data.get('ativo', True)
            )
            
            cursor.execute(query, params)
            novo_id = cursor.lastrowid
            conn.commit()
            
            return {"id": novo_id}
        except Exception as e:
            conn.rollback()
            raise e
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
            
            fields = [
                'nome', 'endereco', 'municipio', 'estado', 'area_total', 'area_pastagem', 
                'capacidade_ua', 'responsavel', 'telefone', 'email', 'observacoes', 'ativo'
            ]
            
            for field in fields:
                if field in data and data[field] is not None:
                    update_fields.append(f"{field} = %s")
                    params.append(data[field])
            
            if not update_fields:
                return
            
            params.append(id)  # para o WHERE id = %s
            
            query = "UPDATE fazendas SET " + ", ".join(update_fields) + " WHERE id = %s"
            cursor.execute(query, tuple(params))
            
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

    @staticmethod
    def delete(id):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Verificar se a fazenda existe
            cursor.execute("SELECT id FROM fazendas WHERE id = %s", (id,))
            if not cursor.fetchone():
                raise ValueError("Fazenda não encontrada")
            
            # Verificar se há animais associados a esta fazenda
            cursor.execute("SELECT COUNT(*) as total FROM animais WHERE fazenda_id = %s", (id,))
            result = cursor.fetchone()
            if result and result[0] > 0:
                raise ValueError("Não é possível excluir a fazenda pois existem animais associados a ela")
            
            # Excluir a fazenda
            cursor.execute("DELETE FROM fazendas WHERE id = %s", (id,))
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

    @staticmethod
    def get_active_fazendas():
        """Retorna todas as fazendas ativas para uso em selects"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT id, nome
                FROM fazendas
                WHERE ativo = TRUE
                ORDER BY nome
            """
            
            cursor.execute(query)
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @staticmethod
    def count_animais_por_fazenda():
        """Retorna a contagem de animais por fazenda"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT f.id, f.nome, COUNT(a.id) as total_animais
                FROM fazendas f
                LEFT JOIN animais a ON f.id = a.fazenda_id
                WHERE f.ativo = TRUE
                GROUP BY f.id, f.nome
                ORDER BY f.nome
            """
            
            cursor.execute(query)
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()