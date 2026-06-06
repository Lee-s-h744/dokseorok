import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/index.js'
import { signToken, authRequired } from '../middleware/auth.js'

const router = Router()

const publicUser = (u) => ({ id: u.id, email: u.email, nickname: u.nickname })

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, password, nickname } = req.body
    if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: '이미 가입된 이메일입니다.' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      password: hash,
      nickname: nickname || email.split('@')[0],
    })
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' })
  }
})

// 내 정보 (토큰 검증)
router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
  res.json({ user: publicUser(user) })
})

// 닉네임 변경
router.patch('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
  if (req.body.nickname) user.nickname = req.body.nickname
  await user.save()
  res.json({ user: publicUser(user) })
})

export default router
