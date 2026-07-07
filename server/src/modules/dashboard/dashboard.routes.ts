import express from 'express';
import dashboardController from './dashboard.controller';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';

const router = express.Router();

router.use(auth);

router.get('/stats', authorize('dashboard:read'), dashboardController.getStats);

export default router;
