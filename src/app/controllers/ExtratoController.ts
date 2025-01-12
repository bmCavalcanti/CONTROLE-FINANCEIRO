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

            const filePath = req.file.path;
            const importFile = await ExtratoService.import(filePath)

            return res.status(importFile.status ? 200 : 500).json(importFile);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar processar a importação"
            })
        }
    }
}