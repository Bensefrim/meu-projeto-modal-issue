import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.database import get_db_connection
from utils.date_utils import format_date, parse_date

class Animal:
    @staticmethod
    def get_all(limit=100, offset=0):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT id, codigo, tipo, raca, data_nascimento, peso, sexo, status, observacoes
                FROM animais
                ORDER BY codigo
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
                SELECT id, codigo, tipo, raca, data_nascimento, peso, sexo, status, observacoes
                FROM animais
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
                SELECT id, codigo, tipo, raca, data_nascimento, peso, sexo, status, observacoes
                FROM animais
                WHERE 
                    codigo LIKE %s OR
                    tipo LIKE %s OR
                    raca LIKE %s OR
                    observacoes LIKE %s
                ORDER BY codigo
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
                INSERT INTO animais (
                    codigo, tipo, raca, data_nascimento, 
                    peso, sexo, status, observacoes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Converter data de string para objeto datetime se necessário
            data_nascimento = data.get('data_nascimento')
            if isinstance(data_nascimento, str):
                data_nascimento = parse_date(data_nascimento)
            
            params = (
                data.get('codigo'),
                data.get('tipo'),
                data.get('raca'),
                data_nascimento,
                data.get('peso'),
                data.get('sexo'),
                data.get('status', 'Ativo'),
                data.get('observacoes', '')
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
                'codigo', 'tipo', 'raca', 'data_nascimento', 
                'peso', 'sexo', 'status', 'observacoes'
            ]
            
            for field in fields:
                if field in data and data[field] is not None:
                    update_fields.append(f"{field} = %s")
                    
                    # Tratar campos especiais
                    if field == 'data_nascimento' and isinstance(data[field], str):
                        params.append(parse_date(data[field]))
                    else:
                        params.append(data[field])
            
            if not update_fields:
                return
            
            params.append(id)  # para o WHERE id = %s
            
            query = "UPDATE animais SET " + ", ".join(update_fields) + " WHERE id = %s"
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
            
            # Verificar se o animal existe
            cursor.execute("SELECT id FROM animais WHERE id = %s", (id,))
            if not cursor.fetchone():
                raise ValueError("Animal não encontrado")
            
            # Excluir o animal
            cursor.execute("DELETE FROM animais WHERE id = %s", (id,))
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
    def count_by_tipo():
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT tipo, COUNT(*) as total
                FROM animais
                GROUP BY tipo
                ORDER BY total DESC
            """
            
            cursor.execute(query)
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()