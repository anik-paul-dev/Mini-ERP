import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import supplierController from './supplier.controller';
import { createSupplierSchema, updateSupplierSchema } from './supplier.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('suppliers:read'), supplierController.getAll);
router.get('/:publicId', authorize('suppliers:read'), supplierController.getOne);
router.post('/', authorize('suppliers:create'), validate(createSupplierSchema), supplierController.create);
router.put('/:publicId', authorize('suppliers:update'), validate(updateSupplierSchema), supplierController.update);
router.delete('/:publicId', authorize('suppliers:delete'), supplierController.delete);

export default router;
