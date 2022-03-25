const ee = require('@google/earthengine')
const fp = require('fastify-plugin')
const fs = require('fs')
const path = require('path')

module.exports = fp(function (fastify, opts, next) {
    fastify.decorate('ee', function (callback, errorCallback, authenticationErrorCallback) {
        const credentials = fs.readFileSync(path.resolve(process.env.GEE_KEY_PATH), {encoding:'utf8', flag:'r'});
        ee.data.authenticateViaPrivateKey(
            JSON.parse(credentials),
            () => {ee.initialize(null, null, callback, errorCallback) },
            authenticationErrorCallback
        );
    })
    next()
})


