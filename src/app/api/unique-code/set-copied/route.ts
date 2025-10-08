import { NextRequest, NextResponse } from 'next/server';
import { markUniqueCodeAsCopied } from '@/lib/models/unique_code';

export const dynamic = 'force-dynamic';

// GET /api/unique-code/validate/[code] - Validate a unique code by path parameter
export async function PUT(
  request: NextRequest,
) {
  try {
    const body = await request.json();
    const { code } = body;
    const { is_copied } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    const uniqueCode = await markUniqueCodeAsCopied(code, is_copied);
    
    if (!uniqueCode) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(uniqueCode, { status: 200 });
  } catch (error) {
    console.error('Error validating unique code:', error);
    return NextResponse.json(
      { error: 'Failed to validate unique code' },
      { status: 500 }
    );
  }
}
