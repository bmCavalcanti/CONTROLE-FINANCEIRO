import { Extrato } from '../entities/Extrato';
import fs from "fs";
import { Connection } from '../../database/connection';
import csvParser from "csv-parser";
import { ResponseInfo } from '../interfaces/ResponseInfo';
import { ExtratoTipo } from '../entities/ExtratoTipo';
import { ExtratoCategoria } from '../entities/ExtratoCategoria';
import { Between, In, Not } from 'typeorm';
import moment from 'moment';
import { PalavraChave } from '../entities/PalavraChave';

export class ExtratoService {

    public static async import(filePath: string): Promise<ResponseInfo> {
        try {

            const items: any[] = [];
            const transacoes: Extrato[] = [];

            const extratoRepo = Connection.getRepository(Extrato);

            const palavras = await Connection.getRepository(PalavraChave).find();

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

                            console.log(`${year}-${month}-${day}`);
                            const date = moment(`${year}-${month}-${day}`).utc(true).toDate();

                            let categoria_id = ExtratoCategoria.OUTROS;
                            let tipo_id = undefined;

                            const descricao = item.Descrição.toUpperCase();

                            if (item.Valor > 0) {
                                tipo_id = ExtratoTipo.RECEITA

                                if (item.Valor > 1000) {
                                    categoria_id = ExtratoCategoria.SALARIO;
                                } else {
                                    categoria_id = ExtratoCategoria.OUTROS;
                                }
                            } else {
                                const palavraChave = palavras.find(palavra => descricao.includes(palavra.nome));

                                if (palavraChave) {
                                    tipo_id = palavraChave.tipo_id;
                                    categoria_id = palavraChave.categoria_id;
                                }
                            }

                            const transacao = extratoRepo.create({
                                data: date,
                                valor: parseFloat(item.Valor),
                                id_externo: item.Identificador,
                                descricao: item.Descrição,
                                tipo_id,
                                categoria_id
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

            const where: any = {};
            if (query.data_inicio && query.data_fim) {
                where.data = Between(moment(`${query.data_inicio} 00:00:00`).utc(true).toDate(), moment(`${query.data_fim} 23:59:59`).utc(true).toDate());
            }

            if (query.despesas) {
                where.tipo_id = Not(ExtratoTipo.RECEITA);
                where.categoria_id = Not(ExtratoCategoria.SALARIO);
            }

            if (query.categorias) {
                where.categoria_id = In(query.categorias);
            }

            if (query.tipos) {
                where.tipo_id = In(query.tipos);
            }

            const transacoes = await Connection.getRepository(Extrato).find({
                where,
                relations: ["tipo", "categoria"],
                order: {
                    data: "DESC"
                }
            })

            if (!transacoes || transacoes.length === 0) {
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

    public static async analyzeByPeriod(query?: any): Promise<ResponseInfo> {
        try {

            const where: any = {};

            if (query.data_inicio && query.data_fim) {
                where.data = Between(moment(`${query.data_inicio} 00:00:00`).utc(true).toDate(), moment(`${query.data_fim} 23:59:59`).utc(true).toDate());
            }

            const transacoes = await Connection.getRepository(Extrato).find({
                where,
                relations: ["tipo", "categoria"],
                order: {
                    data: "DESC"
                }
            })

            if (!transacoes || transacoes.length === 0) {
                return {
                    status: false,
                    message: "Nenhuma transação encontrada para o período selecionado",
                };
            }

            let totalReceitas = 0;
            let totalDespesas = 0;
            let totalDespesaSuperflua = 0;
            const mensal: Record<string, { receitas: number; despesas: number }> = {};
            const gastosSuperfluos: Record<string, number> = {};

            for (const transacao of transacoes) {

                const mesAno = moment(transacao.data).add(3, "hour").format("YYYY-MM");

                if (!mensal[mesAno]) {
                    mensal[mesAno] = { receitas: 0, despesas: 0 };
                }

                if (transacao.tipo_id === ExtratoTipo.RECEITA) {
                    totalReceitas += transacao.valor;
                    mensal[mesAno].receitas += transacao.valor;
                } else {
                    totalDespesas += Math.abs(transacao.valor);
                    mensal[mesAno].despesas += Math.abs(transacao.valor);

                    if (transacao.tipo_id === ExtratoTipo.DESPESA_SUPERFLUA) {
                        totalDespesaSuperflua +=  Math.abs(transacao.valor);
                        const categoria = transacao.categoria.nome;
                        gastosSuperfluos[categoria] = (gastosSuperfluos[categoria] || 0) + Math.abs(transacao.valor);
                    }
                }
            };

            const liquidez = totalReceitas - totalDespesas;
            const pontosOrdenados = Object.entries(gastosSuperfluos).sort((a, b) => b[1] - a[1]);

            return {
                status: true,
                message: "Análise concluída",
                data: {
                    liquidez,
                    evolucao: mensal,
                    gastosSuperfluos: pontosOrdenados,
                    totalDespesaSuperflua
                },
            };
        } catch (error) {
            console.error(error);
            return {
                status: false,
                message: "Erro ao realizar a análise",
            };
        }
    }

    public static async forecastFinancialHealth(query?: any): Promise<ResponseInfo> {
        try {
            const where: any = {};

            if (query.data_inicio && query.data_fim) {
                where.data = Between(
                    moment(`${query.data_inicio} 00:00:00`).utc(true).toDate(),
                    moment(`${query.data_fim} 23:59:59`).utc(true).toDate()
                );
            }

            const transacoes = await Connection.getRepository(Extrato).find({
                where,
                relations: ["tipo", "categoria"],
                order: {
                    data: "DESC"
                }
            });

            if (!transacoes || transacoes.length === 0) {
                return {
                    status: false,
                    message: "Nenhuma transação encontrada para o período selecionado",
                };
            }

            let totalReceitas = 0;
            let totalDespesas = 0;
            let totalDespesaFixa = 0;
            let totalDespesaVariavel = 0;
            const mensal: Record<string, { receitas: number; despesas: number }> = {};
            const gastosSuperfluos: Record<string, number> = {};

            for (const transacao of transacoes) {
                const mesAno = moment(transacao.data).add(3, "hour").format("YYYY-MM");

                if (!mensal[mesAno]) {
                    mensal[mesAno] = { receitas: 0, despesas: 0 };
                }

                if (transacao.tipo_id === ExtratoTipo.RECEITA) {
                    totalReceitas += transacao.valor;
                    mensal[mesAno].receitas += transacao.valor;
                } else {
                    totalDespesas += Math.abs(transacao.valor);
                    mensal[mesAno].despesas += Math.abs(transacao.valor);

                    if (transacao.tipo_id === ExtratoTipo.DESPESA_FIXA) {
                        totalDespesaFixa += Math.abs(transacao.valor);
                    } else if (transacao.tipo_id === ExtratoTipo.DESPESA_VARIAVEL) {
                        totalDespesaVariavel += Math.abs(transacao.valor);
                    } else if (transacao.tipo_id === ExtratoTipo.DESPESA_SUPERFLUA) {
                        const categoria = transacao.categoria.nome;
                        gastosSuperfluos[categoria] = (gastosSuperfluos[categoria] || 0) + Math.abs(transacao.valor);
                    }
                }
            }

            const mesesFuturos = 3;
            const saldoAtual = totalReceitas - totalDespesas;
            const saldoFuturoEstimado = saldoAtual + (totalReceitas - totalDespesaFixa - totalDespesaVariavel) * mesesFuturos;

            const gastosSuperfluosOrdenados = Object.entries(gastosSuperfluos).sort((a, b) => b[1] - a[1]);

            return {
                status: true,
                message: "Previsão de saúde financeira pros próximos 3 meses calculada com sucesso",
                data: {
                    saldoAtual,
                    saldoFuturoEstimado,
                    gastosSuperfluos: gastosSuperfluosOrdenados,
                    totalDespesaFixa,
                    totalDespesaVariavel,
                    totalDespesaSuperflua: Object.values(gastosSuperfluos).reduce((acc, curr) => acc + curr, 0)
                },
            };
        } catch (error) {
            console.error(error);
            return {
                status: false,
                message: "Erro ao realizar a previsão da saúde financeira",
            };
        }
    }
}