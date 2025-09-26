import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const required = (name, val) => {
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
};

const REGION = process.env.R2_REGION || 'auto';
const ENDPOINT = required('R2_ENDPOINT', process.env.R2_ENDPOINT);
const ACCESS_KEY_ID = required('R2_ACCESS_KEY_ID', process.env.R2_ACCESS_KEY_ID);
const SECRET_ACCESS_KEY = required('R2_SECRET_ACCESS_KEY', process.env.R2_SECRET_ACCESS_KEY);

export const BUCKETS = {
  products: required('R2_BUCKET_PRODUCTS', process.env.R2_BUCKET_PRODUCTS),
  research: required('R2_BUCKET_RESEARCH', process.env.R2_BUCKET_RESEARCH),
  models: required('R2_BUCKET_MODELS', process.env.R2_BUCKET_MODELS),
};

const s3 = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function putObject(bucket, key, body, contentType) {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType });
  await s3.send(cmd);
  return { bucket, key };
}

export async function getSignedGetUrl(bucket, key, expiresIn = 600) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, cmd, { expiresIn });
  return url;
}

export async function deleteObject(bucket, key) {
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3.send(cmd);
  return true;
}

function baseForBucket(bucket) {
  if (bucket === BUCKETS.products && process.env.R2_PUBLIC_BASE_PRODUCTS) return process.env.R2_PUBLIC_BASE_PRODUCTS;
  if (bucket === BUCKETS.research && process.env.R2_PUBLIC_BASE_RESEARCH) return process.env.R2_PUBLIC_BASE_RESEARCH;
  if (bucket === BUCKETS.models && process.env.R2_PUBLIC_BASE_MODELS) return process.env.R2_PUBLIC_BASE_MODELS;
  return null;
}

export function getPublicUrl(bucket, key) {
  const base = baseForBucket(bucket);
  if (!base) return null;
  const cleanedBase = base.replace(/\/$/, '');
  const cleanedKey = String(key).replace(/^\//, '');
  return `${cleanedBase}/${cleanedKey}`;
}
