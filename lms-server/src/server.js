const http = require('http');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');

async function start() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
