from datetime import datetime
import pytz

def get_current_time_gmt4():
    """
    Retorna a data e hora atual no fuso horário GMT-4 (América/Cuiaba)
    """
    tz = pytz.timezone('America/Cuiaba')
    return datetime.now(tz)

def format_date(date_obj, format_str='%d/%m/%Y'):
    """
    Formata um objeto datetime para string no formato especificado
    """
    if not date_obj:
        return ""
    return date_obj.strftime(format_str)

def parse_date(date_str, format_str='%d/%m/%Y'):
    """
    Converte uma string de data para objeto datetime
    """
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError:
        return None