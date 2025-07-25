#!/usr/bin/env python3
"""
Script para gerar ícones para o Progressive Web App (PWA)
Este script redimensiona uma imagem base para criar os ícones necessários para o PWA.

Requisitos:
- Python 3.6+
- Pillow (PIL): pip install Pillow

Uso:
python generate_pwa_icons.py [<caminho_da_imagem_base>]

Se nenhum caminho for fornecido, o script criará ícones coloridos simples.

Exemplos:
python generate_pwa_icons.py                  # Cria ícones coloridos simples
python generate_pwa_icons.py logo.png         # Usa uma imagem PNG como base
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

def create_simple_icon(size, text="Pecuária"):
    """
    Cria um ícone simples com um fundo colorido e texto.
    
    Args:
        size (tuple): Tamanho do ícone (largura, altura)
        text (str): Texto a ser exibido no ícone
        
    Returns:
        PIL.Image: Imagem criada
    """
    # Cores
    background_color = (43, 125, 43)  # Verde escuro
    text_color = (255, 255, 255)      # Branco
    
    # Criar imagem com fundo colorido
    image = Image.new('RGB', size, background_color)
    draw = ImageDraw.Draw(image)
    
    # Desenhar um círculo mais claro no centro
    circle_radius = min(size) // 2 - 10
    circle_center = (size[0] // 2, size[1] // 2)
    circle_color = (60, 159, 60)  # Verde mais claro
    
    # Desenhar o círculo
    draw.ellipse(
        (
            circle_center[0] - circle_radius,
            circle_center[1] - circle_radius,
            circle_center[0] + circle_radius,
            circle_center[1] + circle_radius
        ),
        fill=circle_color
    )
    
    # Tentar carregar uma fonte
    font_size = size[0] // 10
    font = None
    
    try:
        # Tentar usar uma fonte do sistema
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        try:
            # Tentar usar a fonte padrão
            font = ImageFont.load_default()
        except:
            print("Aviso: Não foi possível carregar uma fonte.")
    
    # Adicionar texto
    if font:
        # Calcular posição do texto
        text_width = draw.textlength(text, font=font) if hasattr(draw, 'textlength') else font_size * len(text) // 2
        text_position = ((size[0] - text_width) // 2, size[1] - font_size * 2)
        
        # Desenhar o texto
        draw.text(text_position, text, fill=text_color, font=font)
    
    # Desenhar um símbolo simples de boi (silhueta básica)
    cow_color = (255, 255, 255)  # Branco
    
    # Cabeça
    head_center = (size[0] // 2, size[1] // 2 - size[1] // 10)
    head_size = size[0] // 8
    draw.ellipse(
        (
            head_center[0] - head_size,
            head_center[1] - head_size,
            head_center[0] + head_size,
            head_center[1] + head_size
        ),
        fill=cow_color
    )
    
    # Corpo
    body_top = head_center[1] + head_size // 2
    body_width = size[0] // 3
    body_height = size[1] // 4
    draw.ellipse(
        (
            head_center[0] - body_width // 2,
            body_top,
            head_center[0] + body_width // 2,
            body_top + body_height
        ),
        fill=cow_color
    )
    
    # Chifres
    horn_size = size[0] // 16
    # Chifre esquerdo
    draw.ellipse(
        (
            head_center[0] - head_size - horn_size,
            head_center[1] - head_size - horn_size,
            head_center[0] - head_size + horn_size,
            head_center[1] - head_size + horn_size
        ),
        fill=cow_color
    )
    # Chifre direito
    draw.ellipse(
        (
            head_center[0] + head_size - horn_size,
            head_center[1] - head_size - horn_size,
            head_center[0] + head_size + horn_size,
            head_center[1] - head_size + horn_size
        ),
        fill=cow_color
    )
    
    return image

def generate_icons(base_image_path=None):
    """
    Gera ícones para PWA a partir de uma imagem base ou cria ícones simples.
    
    Args:
        base_image_path (str, optional): Caminho para a imagem base.
            Se None, cria ícones simples.
    """
    # Diretório para salvar os ícones
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(current_dir)
    icons_dir = os.path.join(project_dir, 'static', 'icons')
    
    # Definir os tamanhos dos ícones
    icon_sizes = [
        (192, 192),  # Para Android e outros
        (512, 512),  # Para Android e outros (ícone grande)
    ]
    
    # Criar o diretório se não existir
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
        print(f"Diretório criado: {icons_dir}")
    
    # Se um caminho de imagem foi fornecido
    if base_image_path:
        # Verificar se o arquivo existe
        if not os.path.exists(base_image_path):
            print(f"Erro: O arquivo {base_image_path} não existe.")
            return False
        
        # Abrir a imagem base
        try:
            base_image = Image.open(base_image_path)
            print(f"Imagem base carregada: {base_image_path}")
        except Exception as e:
            print(f"Erro ao abrir a imagem: {e}")
            print("Criando ícones simples em vez disso...")
            base_image = None
    else:
        print("Nenhuma imagem base fornecida. Criando ícones simples...")
        base_image = None
    
    # Gerar os ícones
    for size in icon_sizes:
        width, height = size
        icon_name = f"icon-{width}x{height}.png"
        icon_path = os.path.join(icons_dir, icon_name)
        
        if base_image:
            # Redimensionar a imagem base
            resized_image = base_image.resize((width, height), Image.LANCZOS)
        else:
            # Criar um ícone simples
            resized_image = create_simple_icon((width, height))
        
        # Salvar o ícone
        try:
            resized_image.save(icon_path)
            print(f"Ícone gerado: {icon_path}")
        except Exception as e:
            print(f"Erro ao salvar o ícone {icon_path}: {e}")
    
    print("\nÍcones gerados com sucesso!")
    print("Agora você pode remover os arquivos de placeholder .txt")
    return True

def main():
    """Função principal"""
    # Verificar argumentos
    if len(sys.argv) > 2:
        print("Uso: python generate_pwa_icons.py [<caminho_da_imagem_base>]")
        return
    
    # Se um caminho for fornecido, usá-lo; caso contrário, criar ícones simples
    base_image_path = sys.argv[1] if len(sys.argv) == 2 else None
    
    generate_icons(base_image_path)

if __name__ == "__main__":
    main()