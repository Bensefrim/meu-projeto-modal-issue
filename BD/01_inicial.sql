-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS pecuaria_db;
USE pecuaria_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'comum') NOT NULL DEFAULT 'comum',
    senha_temporaria BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de animais
CREATE TABLE IF NOT EXISTS animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    raca VARCHAR(100) NULL,
    data_nascimento DATE NULL,
    peso DECIMAL(10,2) NULL,
    sexo ENUM('M', 'F') NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo',
    observacoes TEXT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir usuário administrador padrão
-- Senha: admin123 (será armazenada com hash pelo sistema)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, senha_temporaria)
VALUES ('Administrador', 'admin@sistema.com', 'admin123', 'admin', TRUE)
ON DUPLICATE KEY UPDATE id = id;

-- Inserir alguns dados de exemplo para animais
INSERT INTO animais (codigo, tipo, raca, data_nascimento, peso, sexo, status, observacoes)
VALUES 
    ('BOV001', 'Bovino', 'Nelore', '2022-01-15', 450.50, 'M', 'Ativo', 'Animal saudável'),
    ('BOV002', 'Bovino', 'Angus', '2021-05-20', 520.75, 'F', 'Ativo', 'Vaca leiteira'),
    ('BOV003', 'Bovino', 'Gir', '2023-03-10', 320.25, 'M', 'Ativo', 'Bezerro'),
    ('SUI001', 'Suíno', 'Duroc', '2023-02-05', 120.50, 'F', 'Ativo', 'Matriz reprodutora'),
    ('SUI002', 'Suíno', 'Landrace', '2023-04-18', 95.75, 'M', 'Ativo', 'Reprodutor'),
    ('CAP001', 'Caprino', 'Boer', '2022-11-30', 65.25, 'F', 'Ativo', 'Cabra leiteira')
ON DUPLICATE KEY UPDATE id = id;