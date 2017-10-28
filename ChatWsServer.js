const WebSocket = require('ws');

const send = (ws, obj) => (ws.send(JSON.stringify(obj)));
const defaultConfig = {
  port: 6613,
};

class ChatWsServer {
  constructor(config) {
    this.config = {};
    Object.assign(this.config, defaultConfig, config);
  }

  connect() {
    if (!this.server) {
      let { port } = this.config;
      this.connectPromise = new Promise((resolve) => {
        console.log(`Init ChatWsServer on 0.0.0.0:${port}`);
        this.server = new WebSocket.Server({ port });
        this.connectPromise = null;
        this.server.on('connection', (ws, req) => {
          send(ws, { type: 'init' });
        });
        resolve(this.server);
      });
    }
    return this.connectPromise || Promise.resolve(this.server);
  }

  close() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(resolve);
        this.server = null;
      });
    }
    return Promise.resolve();
  }
}

module.exports = ChatWsServer;
