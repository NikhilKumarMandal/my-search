import axios from "axios";
import * as cheerio from "cheerio"; 

export async function getSearchResults(query: any, maxResults: any) {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
    });

    // ✅ use cheerio.load, not Cheerio.load
    const $ = cheerio.load(data);

    const results: { title: string; url: string }[] = [];

    $(".result__a").each((i, el) => {
        if (i < maxResults) {
            results.push({
                title: $(el).text(),
                url: $(el).attr("href") || "",
            });
        }
    });

    return results;
}
