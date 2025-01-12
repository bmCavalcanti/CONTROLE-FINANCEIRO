import { Router } from "express";
import { ExtratoController } from "../app/controllers/ExtratoController";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router: Router = Router();

router.get("/extrato/import", upload.single("extrato"), ExtratoController.import);

export { router };