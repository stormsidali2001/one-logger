# @notjustcoders/one-logger-client-sdk

## 1.0.13

### Patch Changes

- build(logger): add tsconfig files for esm, cjs and types builds

## 1.0.11

### Patch Changes

- refactor(config): update ports and cors configuration
- Updated dependencies
  - @notjustcoders/one-logger-server-sdk@1.0.2

## 1.0.10

### Patch Changes

- Fix bug: require is not defined in Node js context adapter

## 1.0.9

### Patch Changes

- Error Serialization at the http transport level for both logging and tracing operations.

## 1.0.8

### Patch Changes

- Batch logging support
- Updated dependencies
  - @notjustcoders/one-logger-server-sdk@1.0.1
  - @notjustcoders/one-logger-types@1.0.1

## 1.0.7

### Patch Changes

- 040c95f: Fix: Bug in Node AsyncLocalStorage adapter

## 1.0.6

### Patch Changes

- Fix bug in NodeJs async context adapter

## 1.0.5

### Patch Changes

- f2c03ea: Async storage support for async execution context isolation in node.
  Adding auto refresh for project logs and traces fetching in the view-web-server.
  Refactoring the project page, traces and logs to support clearing the logs and traces.

## 1.0.4

### Patch Changes

- Fixing The Span age bug that was causing multiple traces.

## 1.0.3

### Patch Changes

- Fix: WrappedClass was not binding the this context of the original class

## 1.0.2

### Patch Changes

- Introducing Class Wrapping Span Support

## 1.0.1

### Patch Changes

- Introducing Span Object Wrapping Support
