import { api, setToken } from './client'

export async function signup(data) {
  const { data: res } = await api.post('/auth/signup', data)
  setToken(res.token)
  return res.user
}

export async function login(creds) {
  const { data: res } = await api.post('/auth/login', creds)
  setToken(res.token)
  return res.user
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function updateNickname(nickname) {
  const { data } = await api.patch('/auth/me', { nickname })
  return data.user
}

export function logout() {
  setToken(null)
}
