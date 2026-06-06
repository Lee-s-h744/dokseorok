import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dokseorok'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose.connection
}
