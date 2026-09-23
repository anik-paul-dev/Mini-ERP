import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import expenseController from './expense.controller';
import { createExpenseSchema, updateExpenseSchema } from './expense.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('expenses:read'), expenseController.getAll);
router.get('/:publicId', authorize('expenses:read'), expenseController.getOne);
router.post('/', authorize('expenses:create'), validate(createExpenseSchema), expenseController.create);
router.put('/:publicId', authorize('expenses:update'), validate(updateExpenseSchema), expenseController.update);
router.delete('/:publicId', authorize('expenses:delete'), expenseController.delete);

export default router;
