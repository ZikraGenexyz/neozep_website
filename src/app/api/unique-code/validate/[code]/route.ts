import { NextRequest, NextResponse } from 'next/server';
import { getUniqueCodeByCode } from '@/lib/models/unique_code';

export const dynamic = 'force-dynamic';

// GET /api/unique-code/validate/[code] - Validate a unique code by path parameter
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    const uniqueCode = await getUniqueCodeByCode(code);
    
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
