import { DataSource } from "typeorm";
import requireDir = require("require-dir");
import 'dotenv/config';

const entitiesObject = requireDir('../app/entities');
const entities = Object.values(entitiesObject);

export const Connection = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: entities.map((element: any) => Object.values(element)[0] as Function).flat(),
    synchronize: false,
    logging: false,
    timezone: "Z",
    extra: {
        connectionLimit: 10,
    },
});

export const initializeDatabase = Connection.initialize()
.then(() => {
    console.info(">>> Banco conectado");
})
.catch((error: any) => {
    console.error(error)
    throw new Error("Não foi possível conectar com o banco de dados")
});