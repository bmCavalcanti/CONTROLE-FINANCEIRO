import { Extrato } from '../entities/Extrato';
import fs, { statSync } from "fs";
import { Connection } from '../../database/connection';
import csvParser from "csv-parser";
import { ResponseInfo } from '../interfaces/ResponseInfo';

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
}