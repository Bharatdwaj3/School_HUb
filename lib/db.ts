// lib/db.ts
import mongoose from 'mongoose';
import { MONGODB_URI } from '@/config/env';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local or .env');
}

declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } | undefined;
}

const cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log('MongoDB connected successfully (SchoolHub)');
      return m.connection;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}