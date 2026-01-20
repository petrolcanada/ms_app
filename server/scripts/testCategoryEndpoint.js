const http = require('http');

// Test the category endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/categories',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\nResponse Body:');
    
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      // Validate response structure
      if (parsed.data && Array.isArray(parsed.data)) {
        console.log('\n✓ Response has correct structure (data field with array)');
        console.log(`✓ Found ${parsed.data.length} categories`);
        console.log('\nFirst 10 categories:');
        parsed.data.slice(0, 10).forEach((cat, idx) => {
          console.log(`  ${idx + 1}. ${cat}`);
        });
      } else {
        console.log('\n✗ Response structure is incorrect');
      }
    } catch (err) {
      console.error('Failed to parse JSON:', err.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  console.log('\nMake sure the backend server is running on port 5000');
});

req.end();
