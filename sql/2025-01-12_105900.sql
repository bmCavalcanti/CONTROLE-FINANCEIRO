INSERT INTO extrato_categoria (nome) VALUES
('Outros'),
('Carro'),
('Casa'),
('Saúde'),
('Sálario'),
('Lazer'),
('Alimentação'),
('Autocuidado');

INSERT INTO extrato_tipo (nome) VALUES
('Receita'),
('Despesa variável'),
('Despesa fixa'),
('Despesa Surpéflua');

ALTER TABLE extrato_tipo ADD cor VARCHAR(10) NOT NULL DEFAULT ('#FEE0E1');
ALTER TABLE extrato_categoria ADD cor VARCHAR(10) NOT NULL DEFAULT ('#FEE0E1');

update extrato_tipo set cor = "#dad7cd" where id = 1;
update extrato_tipo set cor = "#a3b18a" where id = 2;
update extrato_tipo set cor = "#dde5b6" where id = 3;
update extrato_tipo set cor = "#ccd5ae" where id = 4;

update extrato_categoria set cor = "#F8EDEB" where id = 1;
update extrato_categoria set cor = "#FCD5CE" where id = 2;
update extrato_categoria set cor = "#FAE1DD" where id = 3;
update extrato_categoria set cor = "#FEC5BB" where id = 4;
update extrato_categoria set cor = "#FFD7BA" where id = 5;
update extrato_categoria set cor = "#D8E2DC" where id = 6;
update extrato_categoria set cor = "#FEC89A" where id = 7;
update extrato_categoria set cor = "#FFE5D9" where id = 8;

CREATE TABLE palavra_chave (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
);

ALTER TABLE palavra_chave
ADD COLUMN categoria_id INT(11) NOT NULL,
ADD CONSTRAINT fk_palavra_chave_categoria FOREIGN KEY (categoria_id) REFERENCES extrato_categoria(id);

ALTER TABLE palavra_chave
ADD COLUMN tipo_id INT(11) NOT NULL,
ADD CONSTRAINT fk_palavra_chave_tipo FOREIGN KEY (tipo_id) REFERENCES extrato_tipo(id);
