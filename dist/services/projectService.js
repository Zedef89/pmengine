import { DB, notion, notionQuery } from "../config/notion.js";
import { fuzzyFind } from "../utils/fuzzy.js";
import { extractTitle } from "../utils/notionUtils.js";
async function findProjectByNameOrId(term) {
    const list = await notionQuery(DB.PROJECT);
    const items = list.map((page) => ({
        id: page.id,
        name: extractTitle(page)
    }));
    return fuzzyFind(items, term, "name");
}
async function findClientByName(term) {
    const list = await notionQuery(DB.CLIENT);
    const items = list.map((page) => ({
        id: page.id,
        name: page.properties?.Name?.title?.[0]?.plain_text || "",
    }));
    const found = fuzzyFind(items, term || "", "name");
    return found;
}
export async function createProject(payload) {
    const title = payload.title;
    const properties = {
        Name: {
            title: [{ text: { content: title || "Progetto senza nome" } }]
        }
    };
    if (payload.priority) {
        properties["Priority"] = {
            select: { name: payload.priority }
        };
    }
    if (payload.deadline) {
        properties["Deadline"] = {
            date: { start: payload.deadline }
        };
    }
    if (payload.client) {
        const client = await findClientByName(payload.client);
        if (client) {
            properties["Clienti"] = {
                relation: [{ id: client.id }]
            };
        }
    }
    const created = await notion.pages.create({
        parent: { database_id: DB.PROJECT },
        properties
    });
    return {
        action: "create_project",
        status: "created",
        id: created.id
    };
}
export async function updateProject(payload) {
    const matchTerm = payload.id || payload.title;
    if (!matchTerm) {
        return {
            action: "update_project",
            status: "invalid_payload",
            reason: "Manca id o title"
        };
    }
    const found = await findProjectByNameOrId(matchTerm);
    if (!found) {
        return {
            action: "update_project",
            status: "not_found",
            searched: matchTerm
        };
    }
    const properties = {};
    if (payload.fields?.title) {
        properties["Name"] = {
            title: [{ text: { content: payload.fields.title } }]
        };
    }
    if (payload.fields?.priority) {
        properties["Priority"] = {
            select: { name: payload.fields.priority }
        };
    }
    if (payload.fields?.deadline) {
        properties["Deadline"] = {
            date: { start: payload.fields.deadline }
        };
    }
    if (payload.fields?.client) {
        const client = await findClientByName(payload.fields.client);
        if (client) {
            properties["Clienti"] = {
                relation: [{ id: client.id }]
            };
        }
    }
    await notion.pages.update({
        page_id: found.id,
        properties
    });
    return {
        action: "update_project",
        status: "updated",
        id: found.id
    };
}
export async function deleteProject(payload) {
    const matchTerm = payload.id || payload.title;
    if (!matchTerm) {
        return {
            action: "delete_project",
            status: "invalid_payload",
            reason: "Manca id o title"
        };
    }
    const found = await findProjectByNameOrId(matchTerm);
    if (!found) {
        return {
            action: "delete_project",
            status: "not_found",
            searched: matchTerm
        };
    }
    await notion.pages.update({
        page_id: found.id,
        archived: true
    });
    return {
        action: "delete_project",
        status: "deleted",
        id: found.id
    };
}
