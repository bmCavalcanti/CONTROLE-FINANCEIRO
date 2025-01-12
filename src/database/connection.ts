import { DataSource } from "typeorm";
import requireDir = require("require-dir");

const entitiesObject = requireDir('../app/entities');
const entities = Object.values(entitiesObject);

export const Connection = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "bianca-cavalcanti",
    password: "Sukun4",
    database: "controle_financeiro",
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