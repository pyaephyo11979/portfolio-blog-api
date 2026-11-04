import 'dotenv/config';
import multer from 'multer';
import type { Request } from 'express';
import { s3 } from '@utils/s3';

export const upload = multer({ storage: multer.memoryStorage() });
