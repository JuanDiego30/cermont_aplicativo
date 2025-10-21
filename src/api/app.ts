import fs from 'node:fs';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import routes from './routes';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { getVersionInfo } from './utils/version';

const app = express();

app.set('trust proxy', 1);

const corsOptions: CorsOptions = {
  origin: env.frontendOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

if (!fs.existsSync(env.storageDir)) {
  fs.mkdirSync(env.storageDir, { recursive: true });
}
app.use('/data', express.static(env.storageDir, { fallthrough: false }));

app.get('/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/v1/health/version', async (_req, res) => {
  try {
    const versionInfo = await getVersionInfo();
    res.json({
      status: 'ok',
      ...versionInfo,
    });
  } catch (err) {
    console.error('Error in /v1/health/version:', err);
    res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve version information',
    });
  }
});

app.use('/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
