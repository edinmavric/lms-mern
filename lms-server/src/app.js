const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const auth = require('./middleware/auth');
const tenant = require('./middleware/tenant');
const error = require('./middleware/error');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(auth);
app.use(tenant);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(error);

module.exports = app;
