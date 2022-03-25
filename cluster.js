const envs = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(envs)

const os = require("os");
const cluster = require("cluster");
const app = require("./app.js");

const clusterWorkerSize = os.cpus().length;

if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        for (let i=0; i < clusterWorkerSize; i++) {
            cluster.fork();
        }
        cluster.on("exit", function(worker) {
            console.log(process.env.APP_NAME, worker.id, "has exited.")
        })
    } else {
        app.start();
    }
} else {
    app.start();
}
