import z from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  SMTP_HOST: z.string().optional().default('localhost'),
  SMTP_PORT: z.coerce.number().optional().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_CLOUDFRONT_URL: z.string(),
  AWS_S3_BUCKET_NAME: z.string(),
});

export type Env = z.infer<typeof envSchema>;
