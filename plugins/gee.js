const ee = require('@google/earthengine')

module.exports = function (fastify, opts, done) {
    fastify.decorate('ee', function (callback, errorCallback, authenticationErrorCallback) {
        ee.data.authenticateViaPrivateKey(
            this.credentials,
            () => {this.ee.initialize(null, null, callback, errorCallback) },
            authenticationErrorCallback
        );
    })
    done()
  }