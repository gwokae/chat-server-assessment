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

  init() {
    let { port } = this.config;
    console.log(`Init ChatWsServer on 0.0.0.0:${port}`);
    this.server = new WebSocket.Server({ port });

    this.server.on('connection', (ws, req) => {
      send(ws, { msg: 'hello world' });
      ws.on('message', (message) => {
        console.log('received: %s', message);
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }
}

module.exports = ChatWsServer;
