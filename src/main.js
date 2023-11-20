import fastify from 'fastify'
import { createYoga } from 'graphql-yoga'

// This is the fastify instance you have created
const app = fastify({ logger: true })

/**
 * @type {import('graphql-yoga').YogaServerInstance<import('fastify').FastifyReply,import('fastify').FastifyRequest>}
 */
const yoga = createYoga({
  // Integrate Fastify logger
  logging: {
    debug(...args) {
      args.forEach(function pass(arg) {
        app.log.debug(arg)
      })
    },
    info(...args) {
      args.forEach(function pass(arg) {
        app.log.info(arg)
      })
    },
    warn(...args) {
      args.forEach(function pass(arg) {
        app.log.warn(arg)
      })
    },
    error(...args) {
      args.forEach(function pass(arg) {
        app.log.error(arg)
      })
    },
  },
})

/**
 * We pass the incoming HTTP request to GraphQL Yoga
 * and handle the response using Fastify's `reply` API
 * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
 **/
app.route({
  // Bind to the Yoga's endpoint to avoid rendering on any path
  url: yoga.graphqlEndpoint,
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async function serve(req, reply) {
    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await yoga.handleNodeRequest(req, { request: req })
    response.headers.forEach(function pass(value, key) {
      reply.header(key, value)
    })

    reply.status(response.status)

    reply.send(response.body)

    return reply
  },
})

app.listen({ port: 4000 })
