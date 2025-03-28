// Test script for form submission
// Run with: node test-submit.js

const testEntry = {
  date: 'Mar 30',
  description: 'This is a test entry',
  description2: 'Additional details',
  link: 'https://example.com',
};

console.log('Submitting data:', JSON.stringify(testEntry));

// Set your test credentials here
const username = process.env.AUTH_USERNAME || 'testuser';
const password = process.env.AUTH_PASSWORD || 'testpass';
const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

fetch('http://localhost:3000/api/update-csv/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': authHeader
  },
  body: JSON.stringify({ entry: testEntry })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  try {
    console.log('Response:', text);
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  } catch (e) {
    console.log('Could not parse JSON response');
  }
})
.catch(err => console.error('Error:', err));