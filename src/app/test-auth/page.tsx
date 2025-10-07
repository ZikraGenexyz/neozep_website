import { cookies } from 'next/server';

export default function TestAuth() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Auth Test Page</h1>
      <p>Auth Token: {authToken?.value || 'Not found'}</p>
      <p>Token Name: {authToken?.name || 'Not found'}</p>
      <p>Is Authenticated: {authToken?.value === 'authenticated' ? 'Yes' : 'No'}</p>
    </div>
  );
}
