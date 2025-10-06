import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmissionStatus, updateSubmissionVideoUrl, deleteSubmission } from '@/lib/models/submission';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/submissions/[id] - Get a submission by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct object
    const params = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const submission = await getSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission }, { status: 200 });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

// PATCH /api/submissions/[id] - Update a submission's status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct object
    const params = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    let submission;
    
    // Handle video URL update
    if (body.video_url !== undefined) {
      submission = await updateSubmissionVideoUrl(id, body.video_url);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
    } 
    // Handle status update
    if (body.status) {
      if (!['pending', 'finished', 'rejected'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be pending, finished, or rejected' },
          { status: 400 }
        );
      }
      
      submission = await updateSubmissionStatus(id, body.status);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
    }
    
    if (!body.status || body.video_url === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields. Either status or video_url must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({ submission }, { status: 200 });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/[id] - Delete a submission
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct object
    const params = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await deleteSubmission(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Submission deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}