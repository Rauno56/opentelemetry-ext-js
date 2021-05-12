# OpenTelemetry mocha Instrumentation for Node.js
[![NPM version](https://img.shields.io/npm/v/opentelemetry-instrumentation-mocha.svg)](https://www.npmjs.com/package/opentelemetry-instrumentation-mocha)

This module is a mocha [root hook plugin](https://mochajs.org/#root-hook-plugins) which, in the presence of an installed open-telemetry SDK, provides automatic instrumentation for the [mocha testing framework](https://mochajs.org/).
This module provides automatic instrumentation for [`amqplib`](https://github.com/squaremo/amqp.node).

## Installation

```
npm install --save opentelemetry-instrumentation-mocha
```

## Supported Versions
This instrumentation uses [root hook plugins](https://mochajs.org/#root-hook-plugins) which are available from mocha ^8.0.0

## Usage
Load this plugin via the [`--require`](https://mochajs.org/#-require-module-r-module) option of mocha:

### CLI
```js
mocha --require ./node_modules/opentelemetry-instrumentation-mocha
```

### package.json
```json
  "mocha": {
    "require": "./node_modules/opentelemetry-instrumentation-mocha"
  }
```
