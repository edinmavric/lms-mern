const http = require('http');
const mongoose = require('mongoose');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

let server;

async function start() {
  try {
    await connectDB();

    server = http.createServer(app);

    server.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });

    server.on('error', error => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      try {
        await disconnectDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (env.nodeEnv === 'production') {
    // Log to monitoring service in production
  }
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  shutdown('SIGTERM').catch(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
