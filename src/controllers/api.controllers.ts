import { User } from "../models/user.model";
import type { Request, Response } from "express";
import crypto from "crypto";
import type { AuthRequest } from "../types/types";
import { ApiError } from "express-strategy";

export class Api{

    createApiKey = async (req: AuthRequest, res: Response) => {
        try {
            
            const { name } = req.body;

            if (!name) {
                throw new ApiError(400,"Name is required!")
            }

            const id = req.auth?._id;
            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const newKey = crypto.randomBytes(16).toString("hex");

            user.apiKeys.push({
                name,
                key: newKey,
                limit: 1000,   
                used: 0
            });

            await user.save();

            res.status(201).json({
                message: "API key created",
                apiKey: newKey,
                limit: 1000,
                used: 0
            });
        } catch (error) {
            
        }
    }

    deleteApiKey = async (req: AuthRequest, res: Response) => {
        try {
            const { key } = req.body; 

            const id = req.auth?._id;

            if (!id || !key) {
                return res.status(400).json({ error: "userId and key are required" });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const beforeCount = user.apiKeys.length;
            user.apiKeys = user.apiKeys.filter(apiKey => apiKey.key !== key);

            if (user.apiKeys.length === beforeCount) {
                return res.status(404).json({ error: "API key not found" });
            }

            await user.save();

            return res.status(200).json({ message: "API key deleted successfully" });
        } catch (error) {
            console.error("Delete API key error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    listApiKey = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.auth?._id;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const user = await User.findById(userId).select("apiKeys");
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            
            res.status(200).json({
                apiKeys: user.apiKeys.map(key => ({
                    key: key.key,
                    limit: key.limit,
                    used: key.used,
                }))
            });
        } catch (error) {
            console.error("List API keys error:", error);
            res.status(500).json({ error: "Internal server error" });
        }  
    }
}