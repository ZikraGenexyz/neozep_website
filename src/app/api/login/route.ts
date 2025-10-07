import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/models/user';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const passwordValid = await verifyPassword(user, password);
    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
      }
    });
    
    // Set auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: 'authenticated',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'strict',
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}