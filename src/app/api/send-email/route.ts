// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
      const { to, subject, videoUrl, submissionId, submissionData, code } = await request.json();
      
      const result = await sendEmail({
        to,
        subject: subject || `Neozep Video Submission - ID: ${submissionId}`,
        html: `
          <h2>Neozep Video Submission</h2>
          <p>New video submission has been uploaded.</p>
          <p><strong>Submission Code:</strong> ${code}</p>
          <p><strong>Video Link:</strong> <a href="${videoUrl}" target="_blank">Download Video</a></p>
          <p><strong>Submission Details:</strong></p>
          <ul>
            <li>Name: ${submissionData.nama}</li>
            <li>Store: ${submissionData.nama_toko}</li>
            <li>Email: ${submissionData.email}</li>
            <li>Phone: ${submissionData.telepon}</li>
          </ul>
          <p>Sent on: ${new Date().toLocaleString()}</p>
        `,
      });
      
      if (result.success) {
        return NextResponse.json({ message: 'Video link email sent successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to send video email' }, { status: 500 });
      }
    } catch (error) {
      console.error('Video email API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }