import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import './models/index.js'
import { usingKakao } from './services/kakao.js'
import authRoutes from './routes/auth.js'
import bookRoutes from './routes/books.js'
import recordRoutes from './routes/records.js'
import reviewRoutes from './routes/reviews.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ ok: true, db: 'mongodb', kakao: usingKakao() }))
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/reviews', reviewRoutes)

const PORT = process.env.PORT || 4000

async function start() {
  try {
    await connectDB()
    console.log('✅ MongoDB 연결 완료')
    if (!usingKakao()) {
      console.log('ℹ️  KAKAO_REST_API_KEY 미설정 → 샘플 도서 데이터로 동작합니다.')
    }
    app.listen(PORT, () => console.log(`🚀 서버 실행: http://localhost:${PORT}`))
  } catch (e) {
    console.error('❌ MongoDB 연결 실패. .env 의 MONGODB_URI 를 확인하세요.')
    console.error(e.message)
    process.exit(1)
  }
}

start()
