# File Manager

A backend REST API for managing file uploads, downloads, and storage using Node.js, Hono, PostgreSQL, and AWS services.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: [Hono](https://hono.dev/) (with `@hono/node-server`)
- **Database**: PostgreSQL (via `pg` driver)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: AWS S3
- **CDN**: AWS CloudFront (signed URLs)
- **Email**: AWS SES
- **Queue**: AWS SQS
- **Validation**: Zod
- **Auth**: JWT + OTP (passwordless)

## Features

- User auth: OTP via email (SES), JWT session tokens
- Project management with per-project API keys
- Project member roles (owner, admin, member, viewer)
- File upload: single and multipart (for large files)
- Presigned S3 URLs for secure uploads and downloads
- CloudFront signed URLs for CDN delivery
- Folder management (create, rename, delete, move)
- File metadata: name, size, type, folder, storage path
- Per-project storage quota enforcement
- Webhook support with delivery logs (via SQS)
- Analytics per project
- API key-based auth for programmatic access

## Project Structure

```
src/
├── index.ts
├── db/
│   ├── index.ts
│   └── schema/
│       ├── index.ts
│       ├── users.ts
│       ├── otps.ts
│       ├── projects.ts
│       ├── apiKeys.ts
│       ├── projectMembers.ts
│       ├── folders.ts
│       ├── files.ts
│       ├── multipartUploads.ts
│       ├── webhooks.ts
│       └── webhookLogs.ts
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── projects.routes.ts
│   ├── apiKeys.routes.ts
│   ├── files.routes.ts
│   ├── multipart.routes.ts
│   ├── folders.routes.ts
│   ├── analytics.routes.ts
│   └── webhooks.routes.ts
├── controllers/
├── services/
├── helpers/
│   ├── s3.helper.ts
│   ├── otp.helper.ts
│   └── token.helper.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── apiKey.middleware.ts
│   └── rateLimit.middleware.ts
├── validators/
└── utils/
    ├── response.ts
    ├── errors.ts
    └── logger.ts
```

## Environment Variables

See `.env.example` for all required variables.

Key groups:
- **Server**: `PORT`, `NODE_ENV`
- **Database**: `DATABASE_URL`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRES_IN`
- **AWS**: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **S3**: `S3_BUCKET_NAME`
- **CloudFront**: `CLOUDFRONT_DOMAIN`, `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY`
- **SES**: `SES_FROM_EMAIL`
- **SQS**: `SQS_WEBHOOK_QUEUE_URL`
- **Limits**: `UPLOAD_URL_EXPIRY`, `DOWNLOAD_URL_EXPIRY`, `MULTIPART_THRESHOLD`, `DEFAULT_STORAGE_LIMIT_BYTES`
- **OTP**: `OTP_EXPIRY_MINUTES`

## Getting Started

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

## Database Scripts

```bash
npm run db:generate   # generate migrations
npm run db:migrate    # run migrations
npm run db:push       # push schema directly (dev)
npm run db:studio     # open Drizzle Studio
```
