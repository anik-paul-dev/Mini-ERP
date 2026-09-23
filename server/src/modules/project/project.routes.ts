import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import projectController from './project.controller';
import { createProjectSchema, updateProjectSchema } from './project.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('projects:read'), projectController.getAll);
router.get('/:publicId', authorize('projects:read'), projectController.getOne);
router.post('/', authorize('projects:create'), validate(createProjectSchema), projectController.create);
router.put('/:publicId', authorize('projects:update'), validate(updateProjectSchema), projectController.update);
router.delete('/:publicId', authorize('projects:delete'), projectController.delete);

export default router;
