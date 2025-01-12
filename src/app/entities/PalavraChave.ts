import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ExtratoTipo } from "./ExtratoTipo";
import { ExtratoCategoria } from "./ExtratoCategoria";

@Entity("palavra_chave")
export class PalavraChave {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    nome: string;

    @Column({ type: "int" })
    tipo_id?: number;

    @Column({ type: "int" })
    categoria_id: number;

    @ManyToOne(() => ExtratoCategoria, (extratoCategoria) => extratoCategoria.extratos)
    @JoinColumn({ name: "categoria_id" })
    categoria: ExtratoCategoria;

    @ManyToOne(() => ExtratoTipo, (extratoTipo) => extratoTipo.extratos)
    @JoinColumn({ name: "tipo_id" })
    tipo: ExtratoTipo;
}
