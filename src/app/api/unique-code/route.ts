import { NextRequest, NextResponse } from 'next/server';
import { 
  getUniqueCodes, 
  createUniqueCode, 
  getUniqueCodeByCode,
  createMultipleUniqueCodes,
  getUnusedUniqueCodes,
  getUsedUniqueCodes,
  markUniqueCodeAsUsed,
  deleteUniqueCode
} from '@/lib/models/unique_code';

export const dynamic = 'force-dynamic';

// GET /api/unique-code - Get all unique codes or filtered by status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const code = searchParams.get('code');
    
    let codes;
    
    if (code) {
      // Get specific code by code string
      const uniqueCode = await getUniqueCodeByCode(code);
      if (!uniqueCode) {
        return NextResponse.json(
          { error: 'Unique code not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ code: uniqueCode }, { status: 200 });
    }
    
    if (status === 'unused') {
      codes = await getUnusedUniqueCodes();
    } else if (status === 'used') {
      codes = await getUsedUniqueCodes();
    } else {
      codes = await getUniqueCodes();
    }
    
    return NextResponse.json({ codes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unique codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unique codes' },
      { status: 500 }
    );
  }
}

// POST /api/unique-code - Create new unique code(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, count, length } = body;
    
    // If count is provided, create multiple codes
    if (count && count > 0) {
      const codes = await createMultipleUniqueCodes(count, length || 8);
      return NextResponse.json({ codes }, { status: 201 });
    }
    
    // Create single code
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required for single code creation' },
        { status: 400 }
      );
    }
    
    // Check if code already exists
    const existingCode = await getUniqueCodeByCode(code);
    if (existingCode) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    
    const newCode = await createUniqueCode({ code });
    return NextResponse.json({ code: newCode }, { status: 201 });
  } catch (error) {
    console.error('Error creating unique code:', error);
    return NextResponse.json(
      { error: 'Failed to create unique code' },
      { status: 500 }
    );
  }
}

// PUT /api/unique-code/validate/[code] - Mark a unique code as used by path parameter
export async function PUT(
  request: NextRequest
) {
  try {

    const body = await request.json();
    const { code } = body;
    const { submission_id } = body;

    const uniqueCode = await markUniqueCodeAsUsed(code, submission_id);

    if (!uniqueCode) {
      return NextResponse.json(
        { error: 'Invalid or already used code' },
        { status: 400 }
      );
    }

    return NextResponse.json(uniqueCode, { status: 200 });
  } catch (error) {
    console.error('Error marking unique code as used:', error);
    return NextResponse.json(
      { error: 'Failed to mark unique code as used' },
      { status: 500 }
    );
  }
}

// DELETE /api/unique-code/[id] - Delete a unique code by id
export async function DELETE(request: NextRequest) {
  try {
    const { code } = await request.json();
    await deleteUniqueCode(code);
    return NextResponse.json({ message: 'Unique code deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting unique code:', error);
    return NextResponse.json(
      { error: 'Failed to delete unique code' },
      { status: 500 }
    );
  }
}
