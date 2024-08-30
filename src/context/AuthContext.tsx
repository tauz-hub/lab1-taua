"use client";
import { signInRequest } from "@/services/auth";
import { createContext, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies'

import { api } from "@/services/api";
import { recoverUserInformation } from '@/services/auth';

type SignInData = {
  username: string,
  password: string
}

export type User = {
  username: string,
  email: string
}

type AuthContextType = {
  user: User | null,
  isAuthenticated: boolean,
  signIn: (data: SignInData) => Promise<string>
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: any) {

  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;

  async function signIn({ username, password }: SignInData): Promise<string> {
    const token = await signInRequest({
      username,
      password
    })

    if (!token) { return '' }

    destroyCookie(null, 'nextauth.token.uno')
    const ctx = parseCookies(null)
    setCookie(ctx, 'nextauth.token.uno', token, {
      maxAge: 60 * 60 * 24 * 7
    })


    const userInfo = await recoverUserInformation(token);
    setUser(userInfo.user);
    if (userInfo.user != null) {
      destroyCookie(null, 'nextauth.token.user')
      setCookie(ctx, 'nextauth.token.user', userInfo.user.username, {
        maxAge: 60 * 60 * 24 * 7
      })
    }


    api.defaults.headers['Authorization'] = `Bearer ${token}`

    return token
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}
