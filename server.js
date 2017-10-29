const arg = require('commander')
  .version('0.0.1')
  .description('Start chat WS server via command line')
  .option('-p, --port [port]', 'WS listen port')
  .option('-t, --timeout [timeout]', 'Server disconnect client after [timeout] sec inactive', parseInt)
  .parse(process.argv);

const ChatWsServer = require('./ChatWsServer');
console.log(arg);
const server = new ChatWsServer(arg);
server.start();
