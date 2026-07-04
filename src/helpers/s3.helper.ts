import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Disable automatic checksum injection (SDK v3.600+ adds CRC32 by default,
  // which bakes an empty-body checksum into presigned URLs and causes uploads to fail)
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function generatePresignedDownloadUrl(key: string, expiresIn: number): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function copyObjectInS3(sourceKey: string, destKey: string): Promise<void> {
  const command = new CopyObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    CopySource: `${process.env.S3_BUCKET_NAME!}/${sourceKey}`,
    Key: destKey,
  });
  await s3.send(command);
}

export async function deleteObjectFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });
  await s3.send(command);
}

export async function createFolderMarkerInS3(prefix: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: prefix,
    ContentType: "application/x-directory",
  });
  await s3.send(command);
}

export async function initiateMultipartUpload(key: string, contentType: string): Promise<string> {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  const result = await s3.send(command);
  return result.UploadId!;
}

export async function generatePresignedPartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn: number
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await s3.send(command);
}

export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  const command = new AbortMultipartUploadCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    UploadId: uploadId,
  });
  await s3.send(command);
}
