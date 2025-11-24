import Fastify from "fastify";
import executeRoute from "./routes/execute.js";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({
    logger: true,
});

// registra la route
app.register(executeRoute);

// avvio server
app.listen({ port: 3100, host: "0.0.0.0" }, () => {
    console.log("PMEngine running on http://localhost:3100");
});
