import type { Request, Response } from "express";
import { getSearchResults } from "../utils/getSearchResult";


export class Search {

    search = async (req: Request, res: Response) => {
        try {
            const { q, maxResults = 5, topic = "general" } = req.query;

            if (!q) return res.status(400).json({ error: "Missing query" });

            const results = await getSearchResults(q, maxResults);

            req.user.used += 1;
            await req.user.save();

            return res.status(200).json({
                query: q,
                results,
                usage: {
                    limit: req.user.limit,
                    used: req.user.used,
                    remaining: req.user.limit - req.user.used,
                }
            });

        } catch (error:any) {
            res.status(500).json({ error: "Server error", details: error.message });
        }
    }

 }