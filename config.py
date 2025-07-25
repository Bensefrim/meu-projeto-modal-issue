import os
import json
import sys

def get_application_path():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    try:
        return os.path.dirname(os.path.abspath(__file__))
    except NameError:
        return os.getcwd()

def load_db_config():
    application_path = get_application_path()
    config_path = os.path.join(application_path, 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar config.json: {e}")
        return {}

class Config:
    SECRET_KEY = os.urandom(24)
    
    db_config = load_db_config()
    MYSQL_HOST = db_config.get('HOST')
    MYSQL_USER = db_config.get('USER')
    MYSQL_PASSWORD = db_config.get('PASSWORD')
    MYSQL_DB = db_config.get('DATABASE')

    # Adicione outras configurações conforme necessário