import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';

import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import equipmentRouter from './routes/equipment';
import evidenceRouter from './routes/evidence';
import historyRouter from './routes/history';
import ordersRouter from './routes/orders';
import failuresRouter from './routes/failures-json';

const app = express();

app.use(cors({ origin: ENV.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

const PORT = ENV.PORT;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cermont-backend', time: new Date().toISOString() });
});

// Rutas API
app.use('/users', usersRouter);
app.use('/clients', clientsRouter);
app.use('/equipment', equipmentRouter);
app.use('/evidence', evidenceRouter);
app.use('/history', historyRouter);
app.use('/orders', ordersRouter);
app.use('/failures', failuresRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
