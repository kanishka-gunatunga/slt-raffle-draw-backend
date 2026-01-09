import { Router } from 'express';
import { getUsers, createUser, deleteUser, upload } from '../controllers/userController';

const router = Router();

router.get('/', getUsers);
router.post('/', upload.single('photo'), createUser);
router.delete('/:id', deleteUser);

export default router;
