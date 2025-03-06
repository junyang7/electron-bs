const {execFile} = require('child_process');
const log = require('electron-log');
const path = require('path');

class Be {

    constructor() {
        if (Be.instance) {
            return Be.instance;
        }
        this.server = null;
        this.port = 0;
        this.dist = path.join(__dirname, "BE", "dist");
        this.appBin = path.join(this.dist, "app.bin");
        Be.instance = this;
    }

    async start() {
        await this.close();
        return new Promise((resolve, reject) => {
            const onData = (data) => {
                const output = data.toString();
                const match = output.match(/^Server\sis\srunning\son:.*:(\d+)\s*$/);
                if (match) {
                    this.port = match[1];
                    log.info(`Be server started on port ${this.port}`);
                    this.server.stdout.off("data", onData);
                    resolve();
                }
            };
            this.server = execFile(this.appBin, [], (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(new Error(`Failed to start be server: ${stderr || err.message}`));
                }
            });
            this.server.stdout.on("data", onData);
            this.server.on("exit", (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`Be server failed with exit code ${code} and signal ${signal}`));
                }
            });
        });
    }

    async close() {
        if (this.server) {
            await new Promise((resolve, reject) => {
                this.server.kill('SIGINT');
                this.server.on('exit', (code, signal) => {
                    log.info(`Be server exited`);
                    resolve();
                });
            });
            this.server = null;
        }
    }

    getPort() {
        return this.port;
    }

}

module.exports = new Be();
