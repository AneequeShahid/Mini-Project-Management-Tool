import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client = null;

function getClient() {
  if (client) return client;
  const endpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || "us-east-1";
  const accessKey = process.env.MINIO_ACCESS_KEY || process.env.S3_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || process.env.S3_SECRET_KEY || "minioadmin";
  if (!endpoint) return null;
  client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,
  });
  return client;
}

const BUCKET = process.env.MINIO_BUCKET || process.env.S3_BUCKET || "pmtool-uploads";

export async function uploadFile(key, buffer, mimeType) {
  const c = getClient();
  if (!c) throw new Error("Storage not configured. Set MINIO_ENDPOINT or S3_ENDPOINT.");
  await c.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: mimeType }));
  return { key, bucket: BUCKET };
}

export async function getFile(key) {
  const c = getClient();
  if (!c) return null;
  try {
    const { Body, ContentType } = await c.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const chunks = [];
    for await (const chunk of Body) chunks.push(chunk);
    return { buffer: Buffer.concat(chunks), contentType: ContentType };
  } catch { return null; }
}

export async function deleteFile(key) {
  const c = getClient();
  if (!c) return;
  await c.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const c = getClient();
  if (!c) return null;
  return getSignedUrl(c, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function listFiles(prefix = "") {
  const c = getClient();
  if (!c) return [];
  const { Contents } = await c.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));
  return (Contents || []).map((f) => ({ key: f.Key, size: f.Size, lastModified: f.LastModified }));
}
