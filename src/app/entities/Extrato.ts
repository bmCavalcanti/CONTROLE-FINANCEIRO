import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("extrato")
export class Extrato {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "date" })
    data: Date;

    @Column({ type: "varchar", length: 50 })
    id_externo: string;

    @Column({ type: "varchar", length: 255 })
    descricao: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    valor: number;
}
