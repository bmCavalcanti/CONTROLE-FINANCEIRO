import { Extrato } from '../entities/Extrato';
import fs from "fs";
import { Connection } from '../../database/connection';
import csvParser from "csv-parser";
import { ResponseInfo } from '../interfaces/ResponseInfo';
import { ExtratoTipo } from '../entities/ExtratoTipo';
import { ExtratoCategoria } from '../entities/ExtratoCategoria';
import { Between, In } from 'typeorm';

export class ExtratoService {

    public static async import(filePath: string): Promise<ResponseInfo> {
        try {

            const items: any[] = [];
            const transacoes: Extrato[] = [];

            const extratoRepo = Connection.getRepository(Extrato);

            const statusImportacao: ResponseInfo = await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data", (row) => {
                    items.push(row);
                })
                .on("end", async () => {

                    for (let item of items) {
                        const validate = await extratoRepo.findOneBy({ id_externo: item.Identificador, valor: item.Valor })

                        if (!validate) {
                            const [day, month, year] = item.Data.split('/');
                            const date = new Date(`${year}-${month}-${day}`);

                            const transacao = extratoRepo.create({
                                data: date,
                                valor: parseFloat(item.Valor),
                                id_externo: item.Identificador,
                                descricao: item.Descrição,
                                tipo_id: item.Valor > 0 ? ExtratoTipo.RECEITA : undefined,
                                categoria_id: item.Valor > 1000 ? ExtratoCategoria.SALARIO : item.Valor > 0 ? ExtratoCategoria.OUTROS : undefined,
                            });

                            transacoes.push(transacao);
                        }
                    }

                    const extratos = await extratoRepo.save(transacoes);

                    if (transacoes.length === 0) {
                        return resolve({
                            status: false,
                            message: "Todas as transações informadas já existem no banco de dados"
                        })
                    }

                    if (!extratos) {
                        return resolve({
                            status: false,
                            message: "Não foi possível inserir as transações"
                        })
                    }

                    return resolve({
                        status: true,
                        message: "Importação concluída com sucesso",
                    });
                })
                .on("error", (error: any) => {
                    console.error(error);

                    return resolve({
                        status: false,
                        message: "Erro ao tentar realizar a importação"
                    })
                });
            });

            fs.unlinkSync(filePath);

            return statusImportacao;

        } catch (error) {
            console.error(error)

            fs.unlinkSync(filePath);

            return {
                status: false,
                message: "Erro interno ao tentar realizar a importação"
            }
        }
    }

    public static async list(query?: any): Promise<ResponseInfo> {
        try {

            let where = {}

            if (query) {
                if (query.data_inicio && query.data_fim) {
                    where = {
                        data: Between(new Date(`${query.data_inicio} 00:00:00`), new Date(`${query.data_fim} 23:59:59`))
                    }
                }

                if (query.categorias) {
                    where = {
                        ...where,
                        categoria_id: In(query.categorias)
                    }
                }

                if (query.tipos) {
                    where = {
                        ...where,
                        tipo_id: In(query.tipos)
                    }
                }
            }

            const transacoes = await Connection.getRepository(Extrato).find({
                where,
                relations: ["tipo", "categoria"]
            })

            if (!transacoes) {
                return {
                    status: false,
                    message: "Nenhuma transação foi encontrada"
                }
            }

            return {
                status: true,
                message: "Transações encontradas",
                data: transacoes
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as transações"
            }
        }
    }

    public static async get(id: number): Promise<ResponseInfo> {
        try {
            const extrato = await Connection.getRepository(Extrato).findOne({
                where: { id },
                relations: ["tipo", "categoria"]
            })

            if (!extrato) {
                return {
                    status: false,
                    message: "Transação não encontrada"
                }
            }

            return {
                status: true,
                message: "Transação encontrada",
                data: extrato
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar a transação"
            }
        }
    }

    public static async update(id: number, body: any): Promise<ResponseInfo> {
        try {

            const extratoRepo = Connection.getRepository(Extrato);

            const extrato = await extratoRepo.findOneBy({ id })

            if (!extrato) {
                return {
                    status: false,
                    message: "Transação não encontrada"
                }
            }

            extrato.categoria_id = body.categoria_id || extrato.categoria_id
            extrato.tipo_id = body.tipo_id || extrato.tipo_id

            const save = await extratoRepo.save(extrato)

            if (!save) {
                return {
                    status: false,
                    message: "Transação não atualizada"
                }
            }

            return {
                status: true,
                message: "Transação atualizada",
                data: save
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar atualizar a transação"
            }
        }
    }
}