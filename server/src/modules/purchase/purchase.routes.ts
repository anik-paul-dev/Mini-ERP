import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import purchaseController from './purchase.controller';
import { createPurchaseSchema, updatePurchaseSchema } from './purchase.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('purchases:read'), purchaseController.getAll);
router.get('/:publicId', authorize('purchases:read'), purchaseController.getOne);
router.post('/', authorize('purchases:create'), validate(createPurchaseSchema), purchaseController.create);
router.put('/:publicId', authorize('purchases:update'), validate(updatePurchaseSchema), purchaseController.update);
router.delete('/:publicId', authorize('purchases:delete'), purchaseController.delete);

export default router;
