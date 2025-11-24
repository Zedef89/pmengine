export function extractTitle(page) {
    if (!page?.properties)
        return "";
    // cerco la proprietà che ha type: "title"
    const prop = Object.values(page.properties).find((p) => {
        return p && typeof p === "object" && p.type === "title";
    });
    if (!prop || prop.type !== "title")
        return "";
    const titleArray = Array.isArray(prop.title) ? prop.title : [];
    return titleArray
        .map((t) => t?.plain_text || t?.text?.content || "")
        .join(" ")
        .trim();
}
