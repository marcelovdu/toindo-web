import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO;

if (!MONGODB_URI) {
    throw new Error ("Defina a variavel de ambiente do MongoDB")
}

// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  })

  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectToDatabase;