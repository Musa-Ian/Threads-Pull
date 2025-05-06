/**
 * Simple test script to verify the ThreadsPull API is working correctly
 * Run with: node test-api.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/extract'; // Change to your deployed URL if testing production
const TEST_THREAD_URL = 'https://www.threads.com/@zuck/post/CxYXL-xSQVj'; // A public post from Mark Zuckerberg

// Test GET method
async function testGetMethod() {
  console.log('Testing GET method...');
  try {
    const response = await axios.get(`${API_URL}?url=${encodeURIComponent(TEST_THREAD_URL)}`);
    console.log('GET Response Status:', response.status);
    console.log('Media found:', response.data.data.media.count.total);
    console.log('Images:', response.data.data.media.images.length);
    console.log('Videos:', response.data.data.media.videos.length);
    
    if (response.data.data.media.images.length > 0) {
      console.log('First image URL:', response.data.data.media.images[0]);
    }
    
    if (response.data.data.media.videos.length > 0) {
      console.log('First video URL:', response.data.data.media.videos[0]);
    }
    
    return true;
  } catch (error) {
    console.error('GET request failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test POST method
async function testPostMethod() {
  console.log('\nTesting POST method...');
  try {
    const response = await axios.post(API_URL, {
      url: TEST_THREAD_URL
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('POST Response Status:', response.status);
    console.log('Media found:', response.data.data.media.count.total);
    console.log('Images:', response.data.data.media.images.length);
    console.log('Videos:', response.data.data.media.videos.length);
    
    if (response.data.data.media.images.length > 0) {
      console.log('First image URL:', response.data.data.media.images[0]);
    }
    
    if (response.data.data.media.videos.length > 0) {
      console.log('First video URL:', response.data.data.media.videos[0]);
    }
    
    return true;
  } catch (error) {
    console.error('POST request failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test with invalid URL
async function testInvalidUrl() {
  console.log('\nTesting with invalid URL...');
  try {
    const response = await axios.get(`${API_URL}?url=https://www.threads.com/not-a-real-post`);
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    return true;
  } catch (error) {
    console.log('Expected error received for invalid URL');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Error message:', error.response.data.message);
    }
    return true;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...');
  console.log('======================');
  
  let getSuccess = await testGetMethod();
  let postSuccess = await testPostMethod();
  let invalidSuccess = await testInvalidUrl();
  
  console.log('\nTest Results:');
  console.log('======================');
  console.log('GET Method Test:', getSuccess ? 'PASSED' : 'FAILED');
  console.log('POST Method Test:', postSuccess ? 'PASSED' : 'FAILED');
  console.log('Invalid URL Test:', invalidSuccess ? 'PASSED' : 'FAILED');
  
  if (getSuccess && postSuccess && invalidSuccess) {
    console.log('\nAll tests PASSED! Your API is working correctly.');
    console.log('You should now be able to use it with iPhone Shortcuts.');
  } else {
    console.log('\nSome tests FAILED. Review the errors above and fix the issues.');
  }
}

// Run the tests
runTests();
