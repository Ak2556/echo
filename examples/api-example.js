// Example: Authentication and API usage

const API_URL = 'http://localhost:8000';

async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data.access_token;
}

async function getProfile(token) {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Usage
(async () => {
  try {
    const token = await login('user@example.com', 'password');
    const profile = await getProfile(token);
    console.log('User profile:', profile);
  } catch (error) {
    console.error('Error:', error);
  }
})();
