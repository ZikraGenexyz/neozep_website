"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    // Since the cookie is HttpOnly, we can't read it from client-side
    // Instead, we'll make a request to check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Include cookies in the request
        });
        
        if (!response.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
}

export function isAuthenticated(): boolean {
  // Since we can't read HttpOnly cookies from client-side,
  // we'll always return true and let the server-side middleware handle it
  return true;
}