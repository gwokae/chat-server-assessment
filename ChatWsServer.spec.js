const WebSocket = require('ws');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const ChatWsServer = require('./ChatWsServer');

describe('WebSocket Server', () => {
  const server = new ChatWsServer();
  let client;
  it('connect return a promise object', () => {
    const startPromise = server.start();
    expect(startPromise).to.be.a('promise');
  });

  it('able to connect server with 6613 port (default port)', (done) => {
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
