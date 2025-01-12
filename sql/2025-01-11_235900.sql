CREATE DATABASE controle_financeiro;

USE controle_financeiro;

CREATE TABLE extrato (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    id_externo VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL
);
