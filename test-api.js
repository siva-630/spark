import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
const env = dotenv.config().parsed || {};

// Use environment variable API key for testing
const API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key starts with:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not found');

if (!API_KEY) {
  throw new Error('No API key found in GEMINI_API_KEY or VITE_GEMINI_API_KEY');
}


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