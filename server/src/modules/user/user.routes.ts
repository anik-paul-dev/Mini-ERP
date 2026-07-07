import express from 'express';
import userController from './user.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createUserSchema, updateUserSchema } from './user.validation';

const router = express.Router();

router.use(auth);

// Only users with these permissions or Admin can access
router.get('/', authorize('users:read'), userController.getAllUsers);
router.get('/:publicId', authorize('users:read'), userController.getUser);
router.post('/', authorize('users:create'), validate(createUserSchema), userController.createUser);
router.put('/:publicId', authorize('users:update'), validate(updateUserSchema), userController.updateUser);
router.delete('/:publicId', authorize('users:delete'), userController.deleteUser);

export default router;
