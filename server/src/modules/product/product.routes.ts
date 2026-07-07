import express from 'express';
import productController from './product.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createProductSchema, updateProductSchema } from './product.validation';
import upload from '../../middleware/upload';

const router = express.Router();

router.use(auth);

router.get('/', authorize('products:read'), productController.getAllProducts);
router.get('/:publicId', authorize('products:read'), productController.getProduct);
router.post('/', authorize('products:create'), upload.single('image'), validate(createProductSchema), productController.createProduct);
router.put('/:publicId', authorize('products:update'), upload.single('image'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:publicId', authorize('products:delete'), productController.deleteProduct);

export default router;
