import mysql.connector
from mysql.connector import errorcode
import sys
import os
# Adicionar o diretório pai ao path para permitir importações relativas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

# Função para obter uma conexão com o banco de dados
def get_db_connection():
    try:
        print("Tentando conectar ao banco de dados...")
        connection = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB
        )
        print("Conexão bem-sucedida!")
        return connection
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Erro: Nome de usuário ou senha incorretos")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Erro: Banco de dados não existe")
        else:
            print(f"Erro: {err}")
        raise