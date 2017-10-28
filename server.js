const arg = require('commander')
  .version('0.0.1')
  .description('Start chat WS server via command line')
  .option('-p, --port [port]', 'WS listen port');

const ChatWsServer = require('./ChatWsServer');

const server = new ChatWsServer(arg);
server.connect();
