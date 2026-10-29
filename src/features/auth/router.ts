import AuthController from "./controller";
import {Router} from "express";

const authController = new AuthController();
const router = Router();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/refresh-token", (req, res) => authController.refreshToken(req, res));

export default router;