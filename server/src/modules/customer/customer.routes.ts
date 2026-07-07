import express from 'express';
import customerController from './customer.controller';
import validate from '../../middleware/validate';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation';

const router = express.Router();

router.use(auth);

router.get('/', authorize('customers:read'), customerController.getAllCustomers);
router.get('/:publicId', authorize('customers:read'), customerController.getCustomer);
router.post('/', authorize('customers:create'), validate(createCustomerSchema), customerController.createCustomer);
router.put('/:publicId', authorize('customers:update'), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:publicId', authorize('customers:delete'), customerController.deleteCustomer);

export default router;
