import { ResponseInfo } from '../interfaces/ResponseInfo';
import { ExtratoTipo } from '../entities/ExtratoTipo';
import { Connection } from '../../database/connection';

export class ExtratoTipoService {

    public static async list(): Promise<ResponseInfo> {
        try {

            const items = await Connection.getRepository(ExtratoTipo).find()

            if (!items) {
                return {
                    status: false,
                    message: "Nenhum tipo foi encontrado"
                }
            }

            return {
                status: true,
                message: "Tipos encontrados",
                data: items
            }
        } catch (error) {
            console.error(error)
            return {
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar os tipos"
            }
        }
    }
}