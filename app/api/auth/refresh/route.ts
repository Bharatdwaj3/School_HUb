// app/api/auth/refresh/route.ts
import { refreshTokenHandler } from '@/lib/auth';
import { connectDB } from '@/lib/db';

export async function POST() {
  await connectDB();
  return refreshTokenHandler();
}