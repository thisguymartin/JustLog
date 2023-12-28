# 🪵 barebone-logger


Simple Node Logger is a lightweight and easy-to-use logging utility for Node.js applications. It provides a straightforward way to log messages at various levels (debug, info, warn, error, fatal) and supports adding custom fields to logs for more detailed information.

## Features

- Simple and intuitive API.
- Supports multiple log levels: debug, info, warn, error, fatal.
- Ability to add custom fields to logs.
- Toggleable debug mode for development environments.

## Installation

To install Simple Node Logger, use npm:

```bash
npm install simple-node-logger
```

Or using yarn:

```bash
yarn add simple-node-logger
```

## Usage

### Basic Logging


Here's a quick example to get you started:

```javascript
const Logger = require('simple-node-logger');

// Create a new logger instance
const logger = new Logger();

// Logging messages at different levels
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.fatal('This is a fatal message');

```

### Advanced Logging with Custom Fields
To add more context to your logs, you can use withField and withFields methods:



```javascript
// Adding a single custom field
const logWithUser = logger.withField('userId', '12345');
logWithUser.info('User login event');

// Adding multiple custom fields
const response = { status: 404, body: 'Not Found' };
logger.withFields({ response }).error('Response code from OEPricingMultipleV3 API was not 200');

// Chaining fields for more detailed logs
logger
  .withField('userId', '12345')
  .withField('transactionId', 'abcde12345')
  .info('Transaction completed');
```

## API Reference

### `logger.debug(message)`
Logs a debug message.

### `logger.info(message)`
Logs an informational message.

### `logger.warn(message)`
Logs a warning message.

### `logger.error(message)`
Logs an error message.

### `logger.fatal(message)`
Logs a fatal error message.

### `logger.withField(key, value)`
Creates a new logger entry with a field.

### `logger.withFields(fields)`
Creates a new logger entry with multiple fields.

### `logger.setDebug(enabled)`
Enables or disables debug mode.
