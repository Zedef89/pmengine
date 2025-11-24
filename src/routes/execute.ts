import { FastifyInstance } from "fastify";
import { handleToolCall } from "../services/toolDispatcher.js";

export default async function executeRoute(app: FastifyInstance) {
    app.post("/execute", async (request, reply) => {
        try {
            const body = request.body as any;

            if (!body?.tool || !body?.toolInput) {
                return reply.status(400).send({
                    error: "Invalid request",
                });
            }

            const result = await handleToolCall(body);
            return reply.send(result);

        } catch (err: any) {
            console.error(err);
            return reply.status(500).send({
                error: "Internal error",
                details: err.message,
            });
        }
    });
}
