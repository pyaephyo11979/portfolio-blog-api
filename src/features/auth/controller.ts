import AuthService from './service';
import type { Request, Response } from 'express';

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { token, refreshToken, user } = await this.authService.login(
        req.body
      );
      res.status(200).json({ token, refreshToken });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const newToken = await this.authService.refreshToken(token);
      res.status(200).json({ token: newToken });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default AuthController;
