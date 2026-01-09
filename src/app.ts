import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import raffleRoutes from './routes/raffleRoutes';

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/', raffleRoutes); // raffleRoutes has /attendance and /raffle prefixes inside

export default app;
