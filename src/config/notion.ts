import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

export const DB = {
    CLIENT: "2b3aff70-8e2b-80e6-9d61-e28f1545a332",  // PM – Clients
    PROJECT: "2b2aff70-8e2b-808b-9e7c-c7f70a51dcd1", // PM – Projects
    TASK: "2b3aff70-8e2b-80f1-8021-fdda42e35acd",    // PM – Tasks
};

// helper REST per query generica
export async function notionQuery(databaseId: string) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({})
    });

    const data = await response.json();

    console.log("\n\n===== DEBUG QUERY DB =====");
    console.log("DB:", databaseId);
    console.log("Results:", data.results.length);

    try {
        const props = data.results[0]?.properties || {};
        const anyTitleProp: any = Object.values(props).find(
            (p: any) => p && p.type === "title"
        );

        let extractedTitle = "(no title)";
        const titleArray = Array.isArray((anyTitleProp as any)?.title)
            ? (anyTitleProp as any).title
            : [];

        extractedTitle = titleArray
            .map((t: any) => t?.plain_text || t?.text?.content || "")
            .join(" ")
            .trim();

        console.log("First title:", extractedTitle);
    } catch (e) {
        console.log("NO TITLE FOUND");
    }


    console.log("==========================\n\n");

    return data.results;
}
