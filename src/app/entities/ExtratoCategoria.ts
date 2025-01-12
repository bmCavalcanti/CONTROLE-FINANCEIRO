import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Extrato } from "./Extrato";

@Entity("extrato_categoria")
export class ExtratoCategoria {

    static readonly OUTROS = 1;
    static readonly CARRO = 2;
    static readonly CASA = 3;
    static readonly SAUDE = 4;
    static readonly SALARIO = 5;
    static readonly LAZER = 6;
    static readonly ALIMENTACAO = 7;
    static readonly AUTOCUIDADO = 8;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    nome: string;

    @OneToMany(() => Extrato, (extrato) => extrato.categoria)
    extratos: Extrato[];
}
