import { handleTaskCreateOrUpdate, handleTaskDelete } from "./taskService.js";
import { createClient, updateClient, deleteClient } from "./clientService.js";
import { createProject, updateProject, deleteProject } from "./projectService.js";

export async function handleToolCall(body: any) {
    const tool = body.tool;
    const { action, payload } = body.toolInput;

    if (tool !== "PMEngine") {
        return { error: "Tool non supportato" };
    }

    switch (action) {
        // TASK
        case "create_task":
            return await handleTaskCreateOrUpdate(payload, { mode: "create" });
        case "update_task":
            return await handleTaskCreateOrUpdate(payload, { mode: "update" });
        case "delete_task":
            return await handleTaskDelete(payload);

        // CLIENT
        case "create_client":
            return await createClient(payload);
        case "update_client":
            return await updateClient(payload);
        case "delete_client":
            return await deleteClient(payload);

        // PROJECT
        case "create_project":
            return await createProject(payload);
        case "update_project":
            return await updateProject(payload);
        case "delete_project":
            return await deleteProject(payload);

        default:
            return { error: `Azione non supportata: ${action}` };
    }
}
