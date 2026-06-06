import mongoose from 'mongoose'

// users: email, password(bcrypt 해시), nickname, createdAt
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

export const User = mongoose.model('User', userSchema)
