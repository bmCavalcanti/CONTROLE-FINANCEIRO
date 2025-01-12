import express from "express";
import { initializeDatabase } from "./database/connection";
import { router } from "./routes/router";
const cors = require('cors');

export class App {
    public server: express.Application;

    constructor() {
        this.server = express();
        this.server.use(cors());
        this.middleware();
        this.router();
    }

    public async start() {
        try {
            await initializeDatabase;

            this.server.listen(3100, () => {
                console.log(`🔥🔥 Servidor rodando na porta 3100 🔥🔥`);
            });
        } catch (error) {
            console.error("Erro ao conectar com o banco de dados:", error);
            process.exit(1);
        }
    }

    private middleware() {
        this.server.set('trust proxy', 1);
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
    }

    private router() {
        this.server.use('/', router);
    }
}