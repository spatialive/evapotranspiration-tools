const fastify = require('fastify')({
    logger: true,
    disableRequestLogging: false
});

// Declare a route
fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
})

// Run the server!
exports.start = async() => {
    try {
        await fastify.listen(4000);
        console.log(`server listening on ${fastify.server.address().port} and worker ${process.pid}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}