import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check for auth token
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token || token !== 'authenticated') {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      message: 'User is authenticated'
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}
