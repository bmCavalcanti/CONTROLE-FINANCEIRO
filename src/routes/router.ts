import { Router } from "express";
import { ExtratoController } from "../app/controllers/ExtratoController";
import multer from "multer";
import { ExtratoCategoriaController } from "../app/controllers/ExtratoCategoriaController";
import { ExtratoTipoController } from "../app/controllers/ExtratoTipoController";
import { PalavraChaveController } from "../app/controllers/PalavraChaveController";

const upload = multer({ dest: "uploads/" });

const router: Router = Router();

router.get("/palavra_chave/list", PalavraChaveController.list);
router.post("/palavra_chave", PalavraChaveController.insert);
router.put("/palavra_chave/:id", PalavraChaveController.update);
router.delete("/palavra_chave/:id", PalavraChaveController.delete);

router.get("/extrato_tipo/list", ExtratoTipoController.list);
router.get("/extrato_categoria/list", ExtratoCategoriaController.list);

router.get("/extrato/analyse-by-period", ExtratoController.analyzeByPeriod);
router.get("/extrato/forecast-financial-health", ExtratoController.forecastFinancialHealth);

router.post("/extrato/import", upload.single("extrato"), ExtratoController.import);
router.get("/extrato/list", ExtratoController.list);
router.get("/extrato/:id", ExtratoController.get);
router.put("/extrato/:id", ExtratoController.update);

export { router };