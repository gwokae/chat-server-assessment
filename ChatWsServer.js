const WebSocket = require('ws');

const send = (ws, obj) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
};

const defaultConfig = {
  port: 6613,
  timeout: 30,
};

class ChatWsServer {
  constructor(config) {
    this.config = {};
    Object.assign(this.config, defaultConfig, config);
    this.onConnect = this.onConnect.bind(this);
    this.beforeShutdown = this.beforeShutdown.bind(this);
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

    process.on('SIGINT', this.beforeShutdown);
    process.on('SIGTERM', this.beforeShutdown);
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
    send(ws, { type: 'init' });
    let user = { active: true };
    this.users.push(user);
    const updateCurrentUser = (userInfo) => {
      Object.assign(user, userInfo);
    };
    let last;
    let checkInactiveId = setInterval(() => {
      let diff = this.config.timeout - ((Date.now() - last) / 1000);
      if (diff < 0) {
        this.logout(ws, { reason: `Inactive after ${this.config.timeout}s.` }, user, updateCurrentUser);
        clearInterval(checkInactiveId);
      } else if (diff < 10 && Math.ceil(diff) % 5 === 0) {
        send(ws, {
          type: 'message',
          data: {
            type: 'system',
            timestamp: Date.now(),
            text: `You'll logout within ${Math.ceil(diff)}s. A user will logout after ${this.config.timeout}s idle.`,
          },
        });
      }
    }, 1000);
    ws.on('message', (msg) => {
      last = Date.now();
      try {
        const data = JSON.parse(msg);
        this.onMessage(ws, data, user, updateCurrentUser);
      } catch (e) {
        send(ws, { error: `unable to parse message "${msg}", error: "${JSON.stringify(e)}"` });
      }
    });
    ws.on('close', (...all) => {
      console.log(all);
      clearInterval(checkInactiveId);
    });
  }

  onMessage(ws, data, user, updateCurrentUser) {
    const { type, text } = data;
    switch (type) {
      case 'login':
        this.login(ws, data, user, updateCurrentUser);
        break;
      case 'logout':
        this.logout(ws, data, user, updateCurrentUser);
        break;
      case 'message':
        send(ws, { type, accepted: true });
        this.broadcast({
          type,
          data: {
            type, text, nickname: user.nickname, timestamp: Date.now(),
          },
        });
        break;
      default:
        send(ws, { error: `unsupported message type ${type}` });
    }
  }

  login(ws, data, user, updateCurrentUser) {
    const { nickname } = data;
    const sendResp = (error) => {
      let resp = { type: 'login' };
      if (error) {
        resp.accepted = false;
        resp.error = error;
      } else {
        this.users.push(nickname);
        updateCurrentUser({ nickname });
        resp.accepted = true;
        resp.nickname = nickname;

        this.broadcast({
          type: 'message',
          data: {
            type: 'system', text: `${user.nickname} had entered.`, timestamp: Date.now(),
          },
        });
      }
      send(ws, resp);
    };

    if (user.nickname) {
      sendResp('You already login. No multiple login allowed.');
    } else if (this.users.filter(u => u.nickname === nickname).length > 0) {
      sendResp('Failed to connect. Nickname already taken.');
    } else if (nickname) {
      sendResp(null);
    } else {
      sendResp(`attribute 'nickname' not given. data: "${JSON.stringify(data)}"`);
    }
  }

  logout(ws, data, user, updateCurrentUser) {
    updateCurrentUser({ active: false });
    send(ws, { type: 'logout', reason: data.reason });
    ws.close();

    const text = data.reason ?
      `${user.nickname} was disconnected due to inactivity` :
      `${user.nickname} left the chat, connection lost`;

    this.broadcast({
      type: 'message',
      data: {
        type: 'system', text, timestamp: Date.now(),
      },
    });
  }

  broadcast(data) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        send(client, data);
      }
    });
  }

  beforeShutdown() {
    this.broadcast({
      type: 'logout', reason: 'Process got SIGINT or SIGTERM signal',
    });

    process.exit(0);
  }
}

module.exports = ChatWsServer;
