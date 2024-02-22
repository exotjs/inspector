# Exot Inspector

> [!IMPORTANT]  
> Status: under development

Application inspector for Node, Bun and Deno, equipped with powerful tools for monitoring, tracing and debugging.

[![ci](https://github.com/exotjs/inspector/actions/workflows/ci.yml/badge.svg)](https://github.com/exotjs/inspector/actions/workflows/ci.yml)

![Exot Node Inspector](https://github.com/exotjs/inspector/blob/main/assets/exot-inspector-banner.png?raw=true)

## Features

- Metrics, logs, traces, and custom events.
- Monitoring of outgoing HTTP requests.
- Data storage flexibility - without reliance on external services or databases.
- Privacy-first approach: data exchange directly between your server and the application.

## Tools included

- Dashboards
- Logs
- Traces
- Network Inspector
- Error Tracking
- Custom Events
- Environment Inspector

## Install

```sh
npm install @exotjs/inspector
```

## Deno

```ts
import { Inspector } from 'https://deno.land/x/exot_inspector/mod.ts'
```

## Usage

While it's recommended to use a [plugin](#framework-plugins) tailored for your framework, which includes all common functionality and a websocket server, you can also integrate the Inspector manually:


```ts
import { Inspector } from '@exotjs/inspector';
import { MemoryStore } from '@exotjs/inspector/store';

const inspector = new Inspector({
  store: new MemoryStore(),
});

inspector.instruments.traces.trace('trace_name', () => {
  // your function here...
});
```

## Framework plugins

- [Express](https://github.com/exotjs/express)

## Instruments

The inspector includes several built-in instruments for common tasks. They are available under `inspector.instruments.*` and include:

- `errors`
- `events`
- `logs`
- `metrics`
- `network`
- `traces`

## Contributing

See [Contributing Guide](https://github.com/exotjs/inspector/blob/main/CONTRIBUTING.md) and please follow our [Code of Conduct](https://github.com/exotjs/inspector/blob/main/CODE_OF_CONDUCT.md).


## License

MIT