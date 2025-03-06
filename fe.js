const express = require('express');
const path = require('path');
const log = require('electron-log');

class Fe {

    constructor() {
        if (Fe.instance) {
            return Fe.instance;
        }
        this.dist = path.join(__dirname, "FE", "dist");
        this.indexHtml = path.join(this.dist, "index.html");
        this.server = null;
        this.port = 0;
        this.bePort = 0;
        Fe.instance = this;
    }

    async start() {
        await this.close();
        const app = express();
        app.use(express.static(this.dist));
        app.all("/api/port", (req, res) => {
            res.send(this.getBePort());
        });
        app.all('*', (req, res) => {
            res.sendFile(this.indexHtml);
        });
        return new Promise((resolve, reject) => {
            this.server = app.listen(this.port, '0.0.0.0', (err) => {
                if (err) {
                    reject(err);
                }
                this.port = this.server.address().port;
                log.info(`Fe server started on port ${this.port}`);
                resolve();
            });
        });
    }

    async close() {
        if (this.server) {
            await new Promise((resolve, reject) => {
                this.server.close((err) => {
                    log.info(`Fe server exited`);
                    resolve();
                });
            });
            this.server = null;
        }
    }

    getPort() {
        return this.port;
    }

    setBePort(port) {
        this.bePort = port;
    }

    getBePort() {
        return this.bePort;
    }

}

module.exports = new Fe();
