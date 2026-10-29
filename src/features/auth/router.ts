import AuthController from "./controller";
import {Router} from "express";
import {authGuard} from "../../middlewares/auth-guard";

const authController = new AuthController();
const router = Router();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/refresh-token", (req, res) => authController.refreshToken(req, res));

export default router;