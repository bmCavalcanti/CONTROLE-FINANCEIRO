import { Request, Response } from 'express';
import { PalavraChaveService } from '../services/PalavraChaveService';

export class PalavraChaveController {

    static async list(req: Request, res: Response) {
        try {
            const list = await PalavraChaveService.list();
            return res.status(list.status ? 200 : 500).json(list);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar buscar as palavras chave"
            })
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const updateItem = await PalavraChaveService.update(parseInt(req.params.id), req.body);
            return res.status(updateItem.status ? 200 : 500).json(updateItem);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar atualizar a palavra chave"
            })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const deleteItem = await PalavraChaveService.delete(parseInt(req.params.id));
            return res.status(deleteItem.status ? 200 : 500).json(deleteItem);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar deletar a palavra chave"
            })
        }
    }

    static async insert(req: Request, res: Response) {
        try {
            const insertItem = await PalavraChaveService.insert(req.body);
            return res.status(insertItem.status ? 200 : 500).json(insertItem);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                status: false,
                message: "Ocorreu um erro interno ao tentar inserir a palavra chave"
            })
        }
    }
}