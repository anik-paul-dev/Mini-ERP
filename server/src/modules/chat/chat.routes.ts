import express from 'express';
import chatController from './chat.controller';
import auth from '../../middleware/auth';

const router = express.Router();

router.use(auth);

router.get('/contacts', chatController.getContacts);
router.get('/:contactPublicId', chatController.getHistory);
router.post('/', chatController.sendMessage);

export default router;
