import { Router } from "express";
import { ExtratoController } from "../app/controllers/ExtratoController";
import multer from "multer";
import { ExtratoCategoriaController } from "../app/controllers/ExtratoCategoriaController";
import { ExtratoTipoController } from "../app/controllers/ExtratoTipoController";

const upload = multer({ dest: "uploads/" });

const router: Router = Router();

router.get("/extrato_tipo/list", ExtratoTipoController.list);
router.get("/extrato_categoria/list", ExtratoCategoriaController.list);

router.post("/extrato/import", upload.single("extrato"), ExtratoController.import);
router.get("/extrato/list", ExtratoController.list);
router.get("/extrato/:id", ExtratoController.get);
router.put("/extrato/:id", ExtratoController.update);

export { router };