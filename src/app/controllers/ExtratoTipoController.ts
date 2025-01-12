import { Request, Response } from 'express';
import { ExtratoTipoService } from '../services/ExtratoTipoService';

export class ExtratoTipoController {

    static async list(req: Request, res: Response) {
        try {
            const list = await ExtratoTipoService.list();
            return res.status(list.status ? 200 : 500).json(list);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as transações"
            })
        }
    }
}