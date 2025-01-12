import { Request, Response } from 'express';
import { ExtratoService } from '../services/ExtratoService';

export class ExtratoController {
    static async import(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: false,
                    message: "Arquivo não enviado"
                });
            }

            const importFile = await ExtratoService.import(req.file.path)

            return res.status(importFile.status ? 200 : 500).json(importFile);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar processar a importação"
            })
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const list = await ExtratoService.list();
            return res.status(list.status ? 200 : 500).json(list);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as transações"
            })
        }
    }

    static async get(req: Request, res: Response) {
        try {
            const getItem = await ExtratoService.get(parseInt(req.params.id));
            return res.status(getItem.status ? 200 : 500).json(getItem);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar a transação"
            })
        }
    }
}