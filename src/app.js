const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const swaggerUi  = require('swagger-ui-express');
const yaml       = require('js-yaml');
const fs         = require('fs');
const path       = require('path');
const routes     = require('./routes');

const app = express();

const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '..', 'swagger.yaml'), 'utf8')
);

// ── Security & Middleware ──────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // swagger-ui needs inline scripts
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Swagger UI ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

module.exports = app;
