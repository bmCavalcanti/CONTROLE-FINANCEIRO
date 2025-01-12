import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Extrato } from "./Extrato";

@Entity("extrato_tipo")
export class ExtratoTipo {

    static readonly RECEITA = 1;
    static readonly DESPESA_VARIAVEL = 2;
    static readonly DESPESA_FIXA = 3;
    static readonly DESPESA_SUPERFLUA = 4;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    nome: string;

    @OneToMany(() => Extrato, (extrato) => extrato.tipo)
    extratos: Extrato[];
}
