import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: number;
  username: string;
  isAdmin: boolean;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = verify(token, JWT_SECRET) as any;
    
    return {
      id: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };
  } catch (error) {
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
