import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the API key directly for testing
const API_KEY = 'AIzaSyC8Mft7Xo5qKxSwM-NHUriEdp2Vz5AhT9A';

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key starts with:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not found');

if (!API_KEY) {
  console.error('No API key found');
  process.exit(1);
}

// Initialize the model
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function testAPI() {
  try {
    console.log('Testing Gemini API...');
    
    const result = await model.generateContent('Say "Hello, API is working!" in a short response.');
    const response = await result.response;
    const text = response.text();
    
    console.log('API Response:', text);
    console.log('✅ API key is working correctly!');
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testAPI(); 