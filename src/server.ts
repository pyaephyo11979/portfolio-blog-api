import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from '@features/auth/router';
import postsRouter from '@features/posts/route';
import messagesRouter from '@features/messages/router';
import { initPrisma } from '@utils/prisma';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/messages', messagesRouter);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
  initPrisma(process.env.DATABASE_URL!);
});
