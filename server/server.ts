import FastifyVite from '@fastify/vite'
import Fastify from 'fastify'

const server = Fastify()

await server.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  root: import.meta.dirname, // where to look for vite.config.js
  spa: true
})

server.get('/', (req, reply) => {
  return reply.html()
})

await server.vite.ready()
await server.listen({ port: 3000 })
