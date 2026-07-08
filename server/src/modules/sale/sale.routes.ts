import express from 'express';
import saleController from './sale.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createSaleSchema } from './sale.validation';

const router = express.Router();

router.use(auth);

router.get('/', authorize('sales:read'), saleController.getAllSales);
router.get('/export', authorize('sales:export'), saleController.exportSales);
router.get('/:publicId', authorize('sales:read'), saleController.getSale);
router.post('/', authorize('sales:create'), validate(createSaleSchema), saleController.createSale);

export default router;
