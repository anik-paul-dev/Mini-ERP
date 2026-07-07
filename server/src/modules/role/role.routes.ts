import express from 'express';
import roleController from './role.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createRoleSchema, updateRoleSchema } from './role.validation';

const router = express.Router();

router.use(auth);

// Only users with these permissions or Admin can access
router.get('/', authorize('roles:read'), roleController.getAllRoles);
router.get('/:publicId', authorize('roles:read'), roleController.getRole);
router.post('/', authorize('roles:create'), validate(createRoleSchema), roleController.createRole);
router.put('/:publicId', authorize('roles:update'), validate(updateRoleSchema), roleController.updateRole);
router.delete('/:publicId', authorize('roles:delete'), roleController.deleteRole);

export default router;
