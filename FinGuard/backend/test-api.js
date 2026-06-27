async function testAuth() {
  try {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'Password123!';

    console.log('--- Registering ---');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Name', email, password })
    });
    
    if (!regRes.ok) {
        console.error('Register failed:', regRes.status, await regRes.text());
        return;
    }
    console.log('Register success:', await regRes.json());

    console.log('--- Logging in ---');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', loginRes.status, await loginRes.text());
        return;
    }
    console.log('Login success:', await loginRes.json());

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAuth();
