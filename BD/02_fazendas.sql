-- Tabela de fazendas/localização
CREATE TABLE IF NOT EXISTS fazendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NULL,
    municipio VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    area_total DECIMAL(10,2) NULL COMMENT 'Área total em hectares',
    area_pastagem DECIMAL(10,2) NULL COMMENT 'Área de pastagem em hectares',
    capacidade_ua INT NULL COMMENT 'Capacidade em Unidades Animal',
    responsavel VARCHAR(100) NULL,
    telefone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    observacoes TEXT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar coluna de fazenda_id na tabela de animais
ALTER TABLE animais 
ADD COLUMN fazenda_id INT NULL,
ADD CONSTRAINT fk_animal_fazenda FOREIGN KEY (fazenda_id) REFERENCES fazendas(id);

-- Inserir algumas fazendas de exemplo
INSERT INTO fazendas (nome, municipio, estado, area_total, area_pastagem, capacidade_ua, responsavel)
VALUES 
    ('Fazenda São João', 'Cuiabá', 'MT', 1500.00, 1200.00, 1000, 'João Silva'),
    ('Fazenda Boa Esperança', 'Rondonópolis', 'MT', 2200.50, 1800.00, 1500, 'Maria Oliveira'),
    ('Sítio Recanto', 'Várzea Grande', 'MT', 150.00, 120.00, 100, 'Pedro Santos')
ON DUPLICATE KEY UPDATE id = id;