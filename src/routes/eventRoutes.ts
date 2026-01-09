import { Router } from 'express';
import { getEvents, createEvent, getEventById, addGift, addParticipants, deleteGift } from '../controllers/eventController';
import adminAuth from '../middleware/adminAuth';

const router = Router();

router.get('/', getEvents);
router.post('/', adminAuth, createEvent);
router.get('/:id', getEventById);
router.post('/:id/gifts', adminAuth, addGift);
router.delete('/:id/gifts/:giftId', adminAuth, deleteGift);
router.post('/:id/participants', adminAuth, addParticipants);

export default router;
