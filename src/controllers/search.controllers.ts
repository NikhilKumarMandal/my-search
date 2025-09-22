import type { Request, Response } from "express";
import { getSearchResults } from "../utils/getSearchResult";

export class Search {
    search = async (req: Request, res: Response) => {
        try {
            const { q, maxResults = 5, topic = "general" } = req.query;

            if (!q) return res.status(400).json({ error: "Missing query" });
            if (!req.user || !req.apiKey) return res.status(401).json({ error: "Unauthorized" });

            // Atomic increment to avoid race conditions
            const updated = await req.user.updateOne(
                { "apiKeys.key": req.apiKey.key, "apiKeys.used": { $lt: req.apiKey.limit } },
                { $inc: { "apiKeys.$.used": 1 } }
            );

            if (updated.modifiedCount === 0) {
                return res.status(429).json({ error: "API limit exceeded" });
            }

            const results = await getSearchResults(q as string, Number(maxResults));

            return res.status(200).json({
                query: q,
                results,
                usage: {
                    limit: req.apiKey.limit,
                    used: req.apiKey.used + 1, // reflect increment
                    remaining: req.apiKey.limit - (req.apiKey.used + 1),
                },
            });
        } catch (error: any) {
            res.status(500).json({ error: "Server error", details: error.message });
        }
    };
}
