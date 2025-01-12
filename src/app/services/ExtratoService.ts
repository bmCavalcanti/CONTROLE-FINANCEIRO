import { Extrato } from '../entities/Extrato';
import fs, { statSync } from "fs";
import { Connection } from '../../database/connection';
import csvParser from "csv-parser";
import { ResponseInfo } from '../interfaces/ResponseInfo';

export class ExtratoService {

    public static async import(filePath: string): Promise<ResponseInfo> {

        try {
            const transacoes: Extrato[] = [];

            const extratoRepo = Connection.getRepository(Extrato);

            const statusImportacao: ResponseInfo = await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("data",  (row) => {
                    // const validate = await extratoRepo.findOneBy({ id_externo: row.Identificador })
                    // if (!validate) {

                        const dateString = row.Data;
                        const [day, month, year] = dateString.split('/');
                        const date = new Date(`${year}-${month}-${day}`);
                        console.log(date);
                        const transacao = extratoRepo.create({
                            data: date,
                            valor: parseFloat(row.Valor),
                            id_externo: row.Identificador,
                            descricao: row.Descrição,
                        });
                        console.log(transacao)

                        transacoes.push(transacao);
                    // }
                })
                .on("end", async () => {
                    const extratos = await extratoRepo.save(transacoes);

                    console.log(transacoes)
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