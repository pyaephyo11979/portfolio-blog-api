import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};