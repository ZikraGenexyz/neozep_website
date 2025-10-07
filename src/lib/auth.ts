import { cookies } from 'next/headers';

export interface AuthUser {
  id: number;
  username: string;
  isAdmin: boolean;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token || token !== 'authenticated') {
      return null;
    }
    
    // For now, return a basic user object since we're using simple session cookies
    // In a real app, you'd decode the token or fetch user data from database
    return {
      id: 1,
      username: 'admin',
      isAdmin: true
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return user;
}
