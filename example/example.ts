import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { MemoryStore } from '../lib/store.js';
import { Inspector } from '../lib/inspector.js';

const PORT = 3001;

const server = createServer();
const wss = new WebSocketServer({
  noServer: true,
});

const inspector = new Inspector({
  instruments: {
    logs: {
      // disabled: true,
    },
  },
  store: new MemoryStore(),
});

inspector.activate();

function getPath(url: string) {
  const [path] = url.split('?');
  return path;
}

async function delay(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

wss.on('connection', async (ws, req) => {
  const remoteAddress = req.socket.remoteAddress;
  const session = inspector.createSessions({
    remoteAddress,
  });
  session.on('message', (data) => {
    ws.send(data);
  });
  ws.on('close', () => {
    session.destroy();
  });
  ws.on('message', (message) => {
    session.handleMessage(message);
  });
});

server.on('request', async (req, res) => {
  const start = performance.now();
  const path = getPath(req.url || '/');

  res.on('close', () => {
    inspector.instruments.metrics.trackResponse({
      status: res.statusCode,
      duration: performance.now() - start,
    });
  });

  switch (path) {
    case '/':
      console.log({
        headers: req.headers,
        method: req.method,
        url: req.url,
      });
      res.end('Hello');
      break;

    case '/400':
      res.statusCode = 400;
      res.end('400');
      break;

    case '/trace':
      const span = inspector.instruments.traces.startSpan('request');
      inspector.instruments.traces.addAttribute(span, 'method', req.method);
      inspector.instruments.traces.addAttribute(span, 'path', req.url || '/');
      await inspector.instruments.traces.trace('db:select',
        () => {
          return delay(250);
        },
        {
          parent: span,
        },
      );
      await inspector.instruments.traces.trace('db:update', 
        () => {
          return delay(150);
        },
        {
          parent: span,
        },
      );
      res.end();
      inspector.instruments.traces.endSpan(span);
      break;

    case '/error':
      try {
        throw new Error('Test error');
      } catch (err) {
        inspector.instruments.errors.push(err);
        res.statusCode = 500;
        res.end('error');
      }
      break;

    case '/fetch':
      const resp = await fetch('https://httpbin.org/anything', {
        /*
        body: JSON.stringify({
          hello: 'World',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        */
      });
      res.end(JSON.stringify(await resp.json()));
      break;

    default:
      res.statusCode = 404;
      res.end();
  }
});

server.on('upgrade', (req, socket, head) => {
  const path = getPath(req.url || '/');

  if (path === '/_inspector') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
