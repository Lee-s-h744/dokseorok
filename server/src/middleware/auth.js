import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dokseorok-secret-change-me'

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' })
}

// 보호된 라우트용 미들웨어: Authorization: Bearer <token>
export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
  }
}
