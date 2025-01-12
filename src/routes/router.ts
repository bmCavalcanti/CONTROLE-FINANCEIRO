import { Router } from "express";
import { ExtratoController } from "../app/controllers/ExtratoController";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router: Router = Router();

router.post("/extrato/import", upload.single("extrato"), ExtratoController.import);
router.get("/extrato/list", ExtratoController.list);
router.get("/extrato/:id", ExtratoController.get);
router.put("/extrato/:id", ExtratoController.update);

export { router };