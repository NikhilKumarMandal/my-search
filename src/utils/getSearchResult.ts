import axios from "axios";
import * as cheerio from "cheerio"; 

export async function getSearchResults(query: string, maxResults: number) {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(data);

    const results: { title: string; url: string; snippet: string }[] = [];

    $(".result").each((i, el) => {
        if (i < maxResults) {
            const title = $(el).find(".result__a").text();
            const url = $(el).find(".result__a").attr("href") || "";
            const snippet = $(el).find(".result__snippet").text().trim();

            results.push({ title, url, snippet });
        }
    });

    return results;
}

