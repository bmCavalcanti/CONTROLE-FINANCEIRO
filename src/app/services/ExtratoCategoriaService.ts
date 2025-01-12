import { ResponseInfo } from '../interfaces/ResponseInfo';
import { ExtratoCategoria } from '../entities/ExtratoCategoria';
import { Connection } from '../../database/connection';

export class ExtratoCategoriaService {

    public static async list(): Promise<ResponseInfo> {
        try {

            const items = await Connection.getRepository(ExtratoCategoria).find()

            if (!items) {
                return {
                    status: false,
                    message: "Nenhuma categoria foi encontrada"
                }
            }

            return {
                status: true,
                message: "Categorias encontradas",
                data: items
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as categorias"
            }
        }
    }
}