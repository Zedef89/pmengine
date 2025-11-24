export function extractTitle(page: any): string {
    if (!page?.properties) return "";

    // cerco la proprietà che ha type: "title"
    const prop = Object.values(page.properties).find((p: any) => {
        return p && typeof p === "object" && p.type === "title";
    }) as any;

    if (!prop || prop.type !== "title") return "";

    const titleArray = Array.isArray(prop.title) ? prop.title : [];

    return titleArray
        .map((t: any) => t?.plain_text || t?.text?.content || "")
        .join(" ")
        .trim();
}
