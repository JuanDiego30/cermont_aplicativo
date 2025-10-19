import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import equipmentRouter from './routes/equipment';
import evidenceRouter from './routes/evidence';
import historyRouter from './routes/history';
import ordersRouter from './routes/orders';
dotenv.config();
const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
const PORT = process.env.PORT || 4000;
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
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
