import { DB, notion, notionQuery } from "../config/notion.js";
import { fuzzyFind } from "../utils/fuzzy.js";
async function findClientByNameOrId(term) {
    const list = await notionQuery(DB.CLIENT);
    const items = list.map((page) => ({
        id: page.id,
        name: page.properties?.Name?.title?.[0]?.plain_text || "",
    }));
    const found = fuzzyFind(items, term || "", "name");
    return found;
}
export async function createClient(payload) {
    const name = payload.name;
    const email = payload.email;
    const properties = {
        Name: {
            title: [{ text: { content: name || "Cliente senza nome" } }]
        }
    };
    if (email) {
        properties["Email"] = { email };
    }
    const created = await notion.pages.create({
        parent: { database_id: DB.CLIENT },
        properties
    });
    return {
        action: "create_client",
        status: "created",
        id: created.id,
        name,
        email
    };
}
export async function updateClient(payload) {
    const matchTerm = payload.id || payload.name;
    if (!matchTerm) {
        return {
            action: "update_client",
            status: "invalid_payload",
            reason: "Manca id o name"
        };
    }
    const found = await findClientByNameOrId(matchTerm);
    if (!found) {
        return {
            action: "update_client",
            status: "not_found",
            searched: matchTerm
        };
    }
    const properties = {};
    if (payload.fields?.name) {
        properties["Name"] = {
            title: [{ text: { content: payload.fields.name } }]
        };
    }
    if (payload.fields?.email) {
        properties["Email"] = {
            email: payload.fields.email
        };
    }
    await notion.pages.update({
        page_id: found.id,
        properties
    });
    return {
        action: "update_client",
        status: "updated",
        id: found.id
    };
}
export async function deleteClient(payload) {
    const matchTerm = payload.id || payload.name;
    if (!matchTerm) {
        return {
            action: "delete_client",
            status: "invalid_payload",
            reason: "Manca id o name"
        };
    }
    const found = await findClientByNameOrId(matchTerm);
    if (!found) {
        return {
            action: "delete_client",
            status: "not_found",
            searched: matchTerm
        };
    }
    await notion.pages.update({
        page_id: found.id,
        archived: true
    });
    return {
        action: "delete_client",
        status: "deleted",
        id: found.id
    };
}
