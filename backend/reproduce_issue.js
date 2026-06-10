const axios = require('axios');

async function reproduce() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    // 1. Signup/Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }).catch(async (err) => {
      console.log('Login failed, trying signup...');
      return await axios.post(`${baseURL}/auth/signup`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      });
    });

    const token = loginRes.data.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // 2. Create a client
    console.log('Creating a client...');
    const clientRes = await axios.post(`${baseURL}/clients`, {
      name: 'Test Client',
      phone: '1234567890',
      email: 'client@example.com',
      address: '123 Street'
    }, { headers: authHeader });

    const clientId = clientRes.data.id;
    console.log('Client created with ID:', clientId);

    // 3. Try to create a case
    console.log('Creating a case...');
    const caseRes = await axios.post(`${baseURL}/cases`, {
      client_id: clientId,
      case_number: 'CASE-' + Date.now(),
      court_name: 'Supreme Court',
      hearing_date: '2026-12-25',
      description: 'Test case description'
    }, { headers: authHeader });

    console.log('Case created successfully:', caseRes.data);

    // 4. Try to get client details
    console.log('Getting client details...');
    const clientDetailRes = await axios.get(`${baseURL}/clients/${clientId}`, { headers: authHeader });
    console.log('Client details:', clientDetailRes.data);

  } catch (error) {
    console.error('Error during reproduction:', error.response?.data || error.message);
  }
}

reproduce();
