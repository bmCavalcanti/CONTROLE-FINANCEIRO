import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ExtratoTipo } from "./ExtratoTipo";
import { ExtratoCategoria } from "./ExtratoCategoria";

@Entity("extrato")
export class Extrato {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "datetime" })
    data: Date;

    @Column({ type: "varchar", length: 50 })
    id_externo: string;

    @Column({ type: "varchar", length: 255 })
    descricao: string;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    valor: number;

    @Column({ type: "int" })
    tipo_id?: number;

    @Column({ type: "int" })
    categoria_id?: number;

    @ManyToOne(() => ExtratoCategoria, (extratoCategoria) => extratoCategoria.extratos)
    @JoinColumn({ name: "categoria_id" })
    categoria: ExtratoCategoria;

    @ManyToOne(() => ExtratoTipo, (extratoTipo) => extratoTipo.extratos)
    @JoinColumn({ name: "tipo_id" })
    tipo: ExtratoTipo;
}
