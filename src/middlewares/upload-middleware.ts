import 'dotenv/config';
import multerS3 from "multer-s3";
import multer from "multer";
import type { Request } from "express";
import {s3} from "@utils/s3";

const storage = multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME!,
    metadata: function (req: Request, file, cb) {
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req: Request, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({ storage: storage });