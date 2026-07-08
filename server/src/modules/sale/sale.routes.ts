import express from 'express';
import saleController from './sale.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createSaleSchema, salePublicIdSchema, updateSaleSchema } from './sale.validation';

const router = express.Router();

router.use(auth);

router.get('/', authorize('sales:read'), saleController.getAllSales);
router.get('/export', authorize('sales:export'), saleController.exportSales);
router.get('/:publicId', authorize('sales:read'), validate(salePublicIdSchema), saleController.getSale);
router.post('/', authorize('sales:create'), validate(createSaleSchema), saleController.createSale);
router.put('/:publicId', authorize('sales:update'), validate(updateSaleSchema), saleController.updateSale);
router.patch('/:publicId/cancel', authorize('sales:cancel'), validate(salePublicIdSchema), saleController.cancelSale);
router.delete('/:publicId', authorize('sales:delete'), validate(salePublicIdSchema), saleController.deleteSale);

export default router;
