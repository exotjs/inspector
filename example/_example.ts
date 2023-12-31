import { PassThrough } from 'node:stream';
import { Exot } from '@exotjs/exot';
import { adapter } from '@exotjs/exot/adapters/node';
import { WebSocketServer } from 'ws';
import { inspector } from '../lib/index';
import pino from 'pino';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);


const logger = pino({
}, process.stdout);

let activeIntercept = false;
let taskOutput: string = '';
const data: any[] = [];
const stream = new PassThrough({
  objectMode: true,
});

const intercept = () => {
  if (activeIntercept) {
    throw new Error('Unexpected initilization of multiple concurrent stdout interceptors.');
  }

  // @ts-expect-error
  process.stdout.write = (chunk, encoding, callback) => {
    stream.push(chunk);
    if (activeIntercept && typeof chunk === 'string') {
      //stream.push(chunk);
    }

    return originalStdoutWrite(chunk, encoding, callback);
  };

  activeIntercept = true;

  return (): string => {
    const result = taskOutput;

    activeIntercept = false;
    taskOutput = '';

    return result;
  };
};

const flush = intercept();


const exot = new Exot()
  .adapter(adapter({
    wss: new WebSocketServer({
      noServer: true,
    }),
  }))
  //.use(inspector())
  .get('/', ({ method, path }) => {
    logger.info({
      req: {
        method,
        path,
      },
    });
    console.log('> request')
    return 'ok'
  })
  .ws('/_inspector', {
    open(ws) {
      ws.send('hello');
      stream.on('data', (chunk) => {
        ws.send('log:' + chunk);
      })
    },
  });

exot.listen(3000)