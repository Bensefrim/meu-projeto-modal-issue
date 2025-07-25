import mysql.connector
import os

def setup_database():
    print("Iniciando configuração do banco de dados...")
    
    # Conectar ao MySQL sem especificar um banco de dados
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password=""
        )
        cursor = conn.cursor()
        print("Conexão ao MySQL estabelecida com sucesso!")
        
        # Ler o arquivo SQL
        script_path = os.path.join(os.path.dirname(__file__), 'BD', '01_inicial.sql')
        with open(script_path, 'r') as file:
            sql_script = file.read()
        
        # Dividir o script em comandos individuais
        commands = sql_script.split(';')
        
        # Executar cada comando
        for command in commands:
            command = command.strip()
            if command:
                cursor.execute(command)
                print(f"Comando executado: {command[:50]}...")
        
        conn.commit()
        print("Banco de dados configurado com sucesso!")
        
    except mysql.connector.Error as err:
        print(f"Erro ao configurar o banco de dados: {err}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_database()