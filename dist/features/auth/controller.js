import AuthService from "./service.js";
class AuthController {
    authService;
    constructor() {
        this.authService = new AuthService();
    }
    async register(req, res) {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const { token, refreshToken, user } = await this.authService.login(req.body);
            res.status(200).json({ token, refreshToken, user });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            const newToken = await this.authService.refreshToken(token);
            res.status(200).json({ token: newToken });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
export default AuthController;
//# sourceMappingURL=controller.js.map