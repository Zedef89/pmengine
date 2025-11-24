import { notion, DB, notionQuery } from "../config/notion.js";
import { fuzzyFind } from "../utils/fuzzy.js";

type TaskPayload = {
    id?: string;
    title?: string;
    project?: string;
    client?: string;
    deadline?: string | null;
    priority?: string | null;
    fields?: {
        status?: string;
        priority?: string;
    };
};

type Mode = "create" | "update";

export async function handleTaskCreateOrUpdate(
    payload: TaskPayload,
    options: { mode: Mode }
) {
    const { mode } = options;

    const matchTerm = payload.id || payload.title;

    // ---- QUERY via REST ----
    const list = await notionQuery(DB.TASK);

    const items = list.map((page: any) => ({
        id: page.id,
        name: page.properties?.Name?.title?.[0]?.plain_text || "",
    }));

    // ---- CAST FORZA id + name ----
    const found = fuzzyFind(
        items,
        matchTerm || "",
        "name"
    ) as typeof items[0] | null;

    // -------- UPDATE --------
    if (mode === "update") {
        if (!found) {
            return {
                action: "update_task",
                status: "not_found",
                searched: matchTerm,
            };
        }

        const properties: any = {};

        if (payload.fields?.status) {
            properties["Status"] = {
                status: { name: payload.fields.status },
            };
        }

        if (payload.fields?.priority) {
            properties["Priority"] = {
                select: { name: payload.fields.priority },
            };
        }

        if (payload.deadline) {
            properties["Deadline"] = {
                date: { start: payload.deadline },
            };
        }

        await notion.pages.update({
            page_id: found.id,
            properties,
        });

        return {
            action: "update_task",
            status: "updated",
            taskId: found.id,
            name: found.name,
        };
    }

    // -------- CREATE --------
    const properties: any = {
        Name: {
            title: [
                {
                    text: {
                        content: payload.title || matchTerm || "Task senza nome",
                    },
                },
            ],
        },
    };

    if (payload.priority) {
        properties["Priority"] = {
            select: { name: payload.priority },
        };
    }

    if (payload.deadline) {
        properties["Deadline"] = {
            date: { start: payload.deadline },
        };
    }

    const created = await notion.pages.create({
        parent: { database_id: DB.TASK },
        properties,
    });

    return {
        action: "create_task",
        status: "created",
        taskId: created.id,
    };
}

// -------- DELETE --------

export async function handleTaskDelete(payload: TaskPayload) {
    const matchTerm = payload.id || payload.title;

    const list = await notionQuery(DB.TASK);

    const items = list.map((page: any) => ({
        id: page.id,
        name: page.properties?.Name?.title?.[0]?.plain_text || "",
    }));

    const found = fuzzyFind(
        items,
        matchTerm || "",
        "name"
    ) as typeof items[0] | null;

    if (!found) {
        return {
            action: "delete_task",
            status: "not_found",
            searched: matchTerm,
        };
    }

    await notion.pages.update({
        page_id: found.id,
        archived: true,
    });

    return {
        action: "delete_task",
        status: "deleted",
        taskId: found.id,
        name: found.name,
    };
}
