import { DB, notion, notionQuery } from "../config/notion.js";
import { fuzzyFind } from "../utils/fuzzy.js";
import { extractTitle } from "../utils/notionUtils.js";

type ClientPayload = {
    name?: string;
    id?: string;
    email?: string;
    fields?: {
        name?: string;
        email?: string;
    };
};




async function findClientByNameOrId(term: string) {
    const list = await notionQuery(DB.CLIENT);

    const items = list.map((page: any) => ({
        id: page.id,
        name: extractTitle(page)
    }));

    return fuzzyFind(items, term, "name");
}


export async function createClient(payload: ClientPayload) {
    const name = payload.name;
    const email = payload.email;

    const properties: any = {
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

export async function updateClient(payload: ClientPayload) {
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

    const properties: any = {};

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

export async function deleteClient(payload: ClientPayload) {
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
