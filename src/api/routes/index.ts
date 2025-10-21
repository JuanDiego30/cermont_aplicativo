import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import ordersRouter from './ordenes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/ordenes', ordersRouter);

export default router;
