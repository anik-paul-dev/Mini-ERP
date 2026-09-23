import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import assetController from './asset.controller';
import { createAssetSchema, updateAssetSchema } from './asset.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('assets:read'), assetController.getAll);
router.get('/:publicId', authorize('assets:read'), assetController.getOne);
router.post('/', authorize('assets:create'), validate(createAssetSchema), assetController.create);
router.put('/:publicId', authorize('assets:update'), validate(updateAssetSchema), assetController.update);
router.delete('/:publicId', authorize('assets:delete'), assetController.delete);

export default router;
