import { S3Client } from '@aws-sdk/client-s3';

let s3Instance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Instance) {
    s3Instance = new S3Client({
      region: process.env.BUCKET_REGION || 'auto',
      endpoint: process.env.BUCKET_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.BUCKET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return s3Instance;
}

// Export a proxy so any file importing `s3` works seamlessly without top-level instantiation
export const s3 = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getS3Client();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
