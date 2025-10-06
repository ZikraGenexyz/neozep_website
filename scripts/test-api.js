// Script to test API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testGetAllSubmissions() {
  try {
    console.log('Testing GET /api/submissions');
    const response = await fetch(`${BASE_URL}/submissions`);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Number of submissions:', data.submissions.length);
    console.log('First submission:', data.submissions[0]);
    return data.submissions;
  } catch (error) {
    console.error('Error testing GET /api/submissions:', error);
  }
}

async function testGetSubmissionById(id) {
  try {
    console.log(`\nTesting GET /api/submissions/${id}`);
    const response = await fetch(`${BASE_URL}/submissions/${id}`);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Submission:', data.submission);
  } catch (error) {
    console.error(`Error testing GET /api/submissions/${id}:`, error);
  }
}

async function testCreateSubmission() {
  try {
    console.log('\nTesting POST /api/submissions');
    const newSubmission = {
      nama: 'Test User',
      nama_toko: 'Test Shop',
      alamat: 'Test Address, Jakarta',
      email: 'test@example.com',
      telepon: '081234567890'
    };
    
    const response = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubmission),
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Created submission:', data.submission);
    return data.submission;
  } catch (error) {
    console.error('Error testing POST /api/submissions:', error);
  }
}

async function testUpdateSubmissionStatus(id) {
  try {
    console.log(`\nTesting PATCH /api/submissions/${id}`);
    const response = await fetch(`${BASE_URL}/submissions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'finished' }),
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Updated submission:', data.submission);
  } catch (error) {
    console.error(`Error testing PATCH /api/submissions/${id}:`, error);
  }
}

async function testDeleteSubmission(id) {
  try {
    console.log(`\nTesting DELETE /api/submissions/${id}`);
    const response = await fetch(`${BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response message:', data.message);
  } catch (error) {
    console.error(`Error testing DELETE /api/submissions/${id}:`, error);
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test GET all submissions
  const submissions = await testGetAllSubmissions();
  
  if (submissions && submissions.length > 0) {
    // Test GET submission by ID
    await testGetSubmissionById(submissions[0].id);
  }
  
  // Test POST new submission
  const newSubmission = await testCreateSubmission();
  
  if (newSubmission) {
    // Test PATCH submission status
    await testUpdateSubmissionStatus(newSubmission.id);
    
    // Test DELETE submission
    await testDeleteSubmission(newSubmission.id);
  }
  
  console.log('\nAPI tests completed!');
}

runTests();