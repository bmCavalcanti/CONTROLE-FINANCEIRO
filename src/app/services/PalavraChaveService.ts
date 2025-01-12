import { ResponseInfo } from '../interfaces/ResponseInfo';
import { PalavraChave } from '../entities/PalavraChave';
import { Connection } from '../../database/connection';
import { Not } from 'typeorm';

export class PalavraChaveService {

    public static async list(): Promise<ResponseInfo> {
        try {

            const items = await Connection.getRepository(PalavraChave).find({
                relations: ["tipo", "categoria"]
            });

            if (!items) {
                return {
                    status: false,
                    message: "Nenhuma palavra foi encontrada"
                }
            }

            return {
                status: true,
                message: "Palavras encontradas",
                data: items
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as palavras"
            }
        }
    }

    public static async update(id: number, body: any): Promise<ResponseInfo> {
        try {

            const palavraChaveRepo = Connection.getRepository(PalavraChave);

            const nome = body.nome.toUpperCase();
            const palavraChave = await palavraChaveRepo.findOneBy({ id })

            if (!palavraChave) {
                return {
                    status: false,
                    message: "Palavra chave não encontrada"
                }
            }

            const checkPalavraChave = await palavraChaveRepo.findOneBy({ nome, id: Not(id) });

            if (checkPalavraChave) {
                return {
                    status: false,
                    message: "Essa palavra chave já existe"
                }
            }

            palavraChave.nome = nome || palavraChave.nome
            palavraChave.categoria_id = body.categoria_id || palavraChave.categoria_id
            palavraChave.tipo_id = body.tipo_id || palavraChave.tipo_id

            const save = await palavraChaveRepo.save(palavraChave)

            if (!save) {
                return {
                    status: false,
                    message: "Palavra chave não atualizada"
                }
            }

            return {
                status: true,
                message: "Palavra chave atualizada",
                data: save
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar atualizar a palavra chave"
            }
        }
    }

    public static async insert(body: any): Promise<ResponseInfo> {
        try {

            const palavraChaveRepo = Connection.getRepository(PalavraChave);
            const nome = body.nome.toUpperCase();

            const checkPalavraChave = await palavraChaveRepo.findOneBy({ nome });

            if (checkPalavraChave) {
                return {
                    status: false,
                    message: "Essa palavra chave já existe"
                }
            }

            const palavraChave = palavraChaveRepo.create({
                nome: nome,
                categoria_id: body.categoria_id,
                tipo_id: body.tipo_id
            })

            const save = await palavraChaveRepo.save(palavraChave)

            if (!save) {
                return {
                    status: false,
                    message: "Palavra chave não inserida"
                }
            }

            return {
                status: true,
                message: "Palavra chave inserida",
                data: save
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar inserir a palavra chave"
            }
        }
    }
}