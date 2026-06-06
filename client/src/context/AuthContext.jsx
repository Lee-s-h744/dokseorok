import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // 앱 시작 시 토큰이 있으면 내 정보 복원
  useEffect(() => {
    async function init() {
      if (getToken()) {
        try {
          setUser(await authApi.fetchMe())
        } catch {
          authApi.logout()
        }
      }
      setReady(true)
    }
    init()
  }, [])

  const login = useCallback(async (creds) => {
    const u = await authApi.login(creds)
    setUser(u)
    return u
  }, [])

  const signup = useCallback(async (data) => {
    const u = await authApi.signup(data)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  const updateNickname = useCallback(async (nickname) => {
    const u = await authApi.updateNickname(nickname)
    setUser(u)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, updateNickname }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
