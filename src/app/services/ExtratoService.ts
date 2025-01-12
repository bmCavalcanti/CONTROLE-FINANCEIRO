import { Extrato } from '../entities/Extrato';
import fs from "fs";
import { Connection } from '../../database/connection';
import csvParser from "csv-parser";
import { ResponseInfo } from '../interfaces/ResponseInfo';
import { ExtratoTipo } from '../entities/ExtratoTipo';
import { ExtratoCategoria } from '../entities/ExtratoCategoria';

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

    public static async list(): Promise<ResponseInfo> {
        try {
            const transacoes = await Connection.getRepository(Extrato).find({
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
}