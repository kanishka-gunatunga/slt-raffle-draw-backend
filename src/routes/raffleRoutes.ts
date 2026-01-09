import { Router } from 'express';
import { markAttendance, getCandidates, recordWinner } from '../controllers/raffleController';

const router = Router();

router.post('/attendance/mark', markAttendance);
router.get('/raffle/candidates', getCandidates);
router.post('/raffle/record-winner', recordWinner);

export default router;
