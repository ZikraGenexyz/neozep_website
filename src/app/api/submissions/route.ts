import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, getSubmissions } from '@/lib/models/submission';

export const dynamic = 'force-dynamic';

// GET /api/submissions - Get all submissions
export async function GET(request: NextRequest) {
  try {
    // Get status from query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    
    const submissions = await getSubmissions(status);
    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['nama', 'nama_toko', 'alamat', 'email', 'telepon'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create the submission
    const submission = await createSubmission(body);
    
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}