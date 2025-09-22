import type { Request, Response } from "express";
import { getSearchResults } from "../utils/getSearchResult";

export class Search {
    search = async (req: Request, res: Response) => {
        try {
            const { q, maxResults = 5, topic = "general" } = req.query;

            if (!q) return res.status(400).json({ error: "Missing query" });
            if (!req.user) return res.status(401).json({ error: "Unauthorized" });

            const results = await getSearchResults(q, maxResults);

            // Get the first API key (or find the correct one)
            const apiKey = req.user.apiKeys[0];
            if (!apiKey) return res.status(400).json({ error: "No API key found" });

            // Increment usage
            apiKey.used += 1;
            await req.user.save();

            return res.status(200).json({
                query: q,
                results,
                usage: {
                    limit: apiKey.limit,
                    used: apiKey.used,
                    remaining: apiKey.limit - apiKey.used,
                },
            });
        } catch (error: any) {
            res.status(500).json({ error: "Server error", details: error.message });
        }
    };
}
