import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";

export async function checkApiKey(req: Request, res: Response, next: NextFunction) {
    try {
        const apiKey = (req.query.apiKey as string) || (req.headers["x-api-key"] as string);
        if (!apiKey) return res.status(401).json({ error: "API key required" });

        const user = await User.findOne({ "apiKeys.key": apiKey });
        if (!user) return res.status(403).json({ error: "Invalid API key" });

        const keyData = user.apiKeys.find(k => k.key === apiKey);
        if (!keyData) return res.status(403).json({ error: "Invalid API key" });

        if (keyData.used >= keyData.limit) {
            return res.status(429).json({ error: "API limit exceeded" });
        }


        req.user = user;
        req.apiKey = keyData;

        next();
    } catch (err) {
        console.error("API key check failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
