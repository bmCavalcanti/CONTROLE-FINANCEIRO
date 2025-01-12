CREATE DATABASE controle_financeiro;

USE controle_financeiro;

CREATE TABLE extrato (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    id_externo VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL
);

CREATE TABLE extrato_tipo (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE extrato_categoria (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

ALTER TABLE extrato
ADD COLUMN categoria_id INT(11),
ADD CONSTRAINT fk_extrato_categoria FOREIGN KEY (categoria_id) REFERENCES extrato_categoria(id);

ALTER TABLE extrato
ADD COLUMN tipo_id INT(11),
ADD CONSTRAINT fk_extrato_tipo FOREIGN KEY (tipo_id) REFERENCES extrato_tipo(id);
