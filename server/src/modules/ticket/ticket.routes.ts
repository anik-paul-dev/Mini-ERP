import express from 'express';
import auth from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import validate from '../../middleware/validate';
import ticketController from './ticket.controller';
import { createTicketSchema, updateTicketSchema } from './ticket.validation';

const router = express.Router();

router.use(auth);
router.get('/', authorize('tickets:read'), ticketController.getAll);
router.get('/:publicId', authorize('tickets:read'), ticketController.getOne);
router.post('/', authorize('tickets:create'), validate(createTicketSchema), ticketController.create);
router.put('/:publicId', authorize('tickets:update'), validate(updateTicketSchema), ticketController.update);
router.delete('/:publicId', authorize('tickets:delete'), ticketController.delete);

export default router;
