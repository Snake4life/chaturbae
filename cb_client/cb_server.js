var express = require('express');
var http = require('http');
const ChaturbateSocketServer = require('@paulallen87/chaturbate-socket-server');
const app = express();
const server = http.createServer(app);
const cb = new ChaturbateSocketServer(server);

process.on('exit', () => {
  cb.stop();
  server.close();
});

server.listen(8080, () => {
  console.log(`Listening on ${server.address().port}`);
});
