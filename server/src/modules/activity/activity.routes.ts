import express from 'express';
import activityController from './activity.controller';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';

const router = express.Router();

router.use(auth);

router.get('/', authorize('activities:read'), activityController.getAllActivities);

export default router;
