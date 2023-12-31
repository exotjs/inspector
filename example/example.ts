import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { Inspector } from '../lib/inspector';
import { WebSocketController } from '../lib/websocket';

const inspector = new Inspector({
  measurements: [{
    name: 'cpu',
    sensor: 'cpu',
  }, {
    name: 'memory:rss',
    sensor: 'memory-rss',
  }, {
    name: 'memory:heap',
    sensor: 'memory-heap',
  }, {
    name: 'eld',
    sensor: 'event-loop-delay',
  }, {
    name: 'responsetime',
    type: 'number',
  }, {
    name: 'requests:2xx',
    type: 'counter',
  }, {
    name: 'requests:3xx',
    type: 'counter',
  }, {
    name: 'requests:4xx',
    type: 'counter',
  }, {
    name: 'requests:5xx',
    type: 'counter',
  }, {
    name: 'rpm',
    type: 'counter',
  }],
});


const server = createServer();
const wss = new WebSocketServer({
  noServer: true,
});

wss.on('connection', async (ws) => {
  //ws.send('Hello');
  const ctrl = inspector.createWebSocketController();
  ctrl.on('data', (data) => {
    ws.send(data);
  });
  ws.on('message', (message) => {
    ctrl.handleMessage(message);
  });
});

server.on('request', (req, res) => {
  console.log('>> req', req.method, req.url);
  res.end('Hi.');
});

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

const start = Date.now();
inspector.start();

setInterval(() => {
  const statuses = [
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '2xx',
    '3xx', '4xx', '5xx'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  inspector.measurements.counter('requests:' + status).push(1);
  inspector.measurements.counter('responsetime').push(Math.round(Math.random() * 1000));
  inspector.measurements.counter('rpm').push(Math.floor(Math.random() * 10));
}, 1000)

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});