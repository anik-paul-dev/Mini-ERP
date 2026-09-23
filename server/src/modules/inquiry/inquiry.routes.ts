import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import inquiryController from './inquiry.controller';
import { createInquirySchema, updateInquirySchema } from './inquiry.validation';

const router = express.Router();

router.post('/public', validate(createInquirySchema), inquiryController.createPublic);
router.use(auth);
router.get('/', authorize('inquiries:read'), inquiryController.getAll);
router.patch('/:publicId/status', authorize('inquiries:update'), validate(updateInquirySchema), inquiryController.updateStatus);
router.delete('/:publicId', authorize('inquiries:delete'), inquiryController.delete);

export default router;
