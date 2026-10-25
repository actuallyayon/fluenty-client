'use client';

import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const { useSession, signIn, signOut, signUp } = authClient;
