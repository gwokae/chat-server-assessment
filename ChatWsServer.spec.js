const WebSocket = require('ws');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const ChatWsServer = require('./ChatWsServer');

describe('Test WebSocket Server', () => {
  const server = new ChatWsServer();
  server.init();
  let client;
  it('WS Connectable', (done) => {
    client = new WebSocket('ws://127.0.0.1:6613');
    client.on('open', done);
  });

  it('received a json message', () => {
    client.on('message', (msg) => {
      let obj;
      expect(() => {
        obj = JSON.parse(msg);
      }).to.not.throw();
      expect(obj).to.be.a('object');
    });
  });

  it('client closeable', () => {
    expect(() => {
      client.close();
    }).to.not.throw();
  });

  it('server closeable', () => {
    expect(() => {
      server.close();
    }).to.not.throw();
  });
});
