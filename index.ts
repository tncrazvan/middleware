import fastify from "fastify";
import { createBuiltMeshHTTPHandler } from "./.mesh";

const app = fastify();

const meshHttp = createBuiltMeshHTTPHandler();

app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS"],
  async handler(req, reply) {
    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await meshHttp.handleNodeRequest(req, {
      req,
      reply,
    });
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    reply.status(response.status);

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      reply.send(value);
    }

    return reply;
  },
});

console.log("Serving http://127.0.0.1:4000");

app.listen({
  port: 4000,
});
