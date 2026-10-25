'use client';

import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

const API_BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_API_URL || 'https://fluenty-server.vercel.app');

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const { useSession, signIn, signOut, signUp } = authClient;
