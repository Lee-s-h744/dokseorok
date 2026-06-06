import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || '') + '/api'

export const api = axios.create({ baseURL })

const TOKEN_KEY = 'dokseorok:token'

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 요청마다 JWT 토큰 첨부
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 에러 메시지 정규화
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || '요청 처리 중 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  }
)
