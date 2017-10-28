const WebSocket = require('ws');

const send = (ws, obj) => (ws.send(JSON.stringify(obj)));
const defaultConfig = {
  port: 6613,
};

class ChatWsServer {
  constructor(config) {
    this.config = {};
    Object.assign(this.config, defaultConfig, config);
    this.onConnect = this.onConnect.bind(this);
    this.users = [];
  }

  start() {
    if (!this.server) {
      let { port } = this.config;
      this.connectPromise = new Promise((resolve) => {
        console.log(`Init ChatWsServer on 0.0.0.0:${port}`);
        this.server = new WebSocket.Server({ port });
        this.connectPromise = null;
        this.server.on('connection', this.onConnect);
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

  onConnect(ws) {
    send(ws, { type: 'init', users: this.users });
    let user = {};
    this.users.push(user);
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        this.onMessage(ws, data, user, (userInfo) => {
          if (userInfo.nickname !== user.nickname) {
            this.broadcast({ type: 'system', message: `${userInfo.nickname} was disconnected` });
          }
          Object.assign(user, userInfo);
        });
      } catch (e) {
        send(ws, { error: `unable to parse message "${msg}", error: "${JSON.stringify(e)}"` });
      }
    });
  }

  onMessage(ws, data, user, updateCurrentUser) {
    const { type } = data;
    switch (type) {
      case 'login':
        this.login(ws, data, user, updateCurrentUser);
        break;
      default:
        send(ws, { error: `unsupported message type ${type}` });
    }
  }

  login(ws, data, user, updateCurrentUser) {
    const { nickname } = data;
    if (user.nickname) {
      send(ws, { error: 'You already login. No multiple login allowed.' });
    } else if (this.users.filter(u => u.nickname === nickname).length > 0) {
      send(ws, { error: 'Failed to connect. Nickname already taken.' });
    } else if (nickname) {
      this.users.push(nickname);
      updateCurrentUser({ nickname });
      send(ws, { accepted: 'ok', nickname });
    } else {
      send(ws, { error: `attribute 'nickname' not given. data: "${JSON.stringify(data)}"` });
    }
  }

  broadcast(data) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        send(client, data);
      }
    });
  }
}

module.exports = ChatWsServer;
