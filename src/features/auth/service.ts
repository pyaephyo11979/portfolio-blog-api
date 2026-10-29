import {prisma} from "../../utils/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { registerSchema,loginSchema } from "./schema";

export default class AuthService {
    private static instance: AuthService;
    constructor() {
        if (!AuthService.instance) {
            AuthService.instance = this;
        }
        return AuthService.instance;
    }

    async register(data: {username: string, email: string, password: string}) {
        const {username, email, password} = data;
        const {error} = registerSchema.validate(data);
        if (error) {
            throw new Error(error.details[0]?.message);
        }
        const existingUser = await prisma.user.findUnique({
            where: {email},
        });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        return user;
    }

    async login(data: {email: string, password: string}) {
        const {email, password} = data;
        const {error} = loginSchema.validate(data);
        if (error) {
            throw new Error(error.details[0]?.message);
        }
        const user = await prisma.user.findUnique({
            where: {email},
        });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        }
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET!, {expiresIn: "1h"});
        const refreshToken = jwt.sign({id: user.id}, process.env.JWT_REFRESH_SECRET!, {expiresIn: "7d"});

        return {token,refreshToken, user};
    }

    async refreshToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {id: string};
            const user = await prisma.user.findUnique({
                where: {id: decoded.id},
            });
            if (!user) {
                throw new Error("User not found");
            }
            const newToken = jwt.sign({id: user.id}, process.env.JWT_SECRET!, {expiresIn: "1h"});
            return {token: newToken, user};
        } catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
}