import express from "express";
const router = express.Router();
import * as userController from "../controllers/userController.js";

router.post("/cadastrar", userController.cadastrar);

export default router;
