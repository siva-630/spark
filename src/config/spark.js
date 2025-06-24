



// To run this code:
// 1. Install dependencies: npm install @google/genai mime
// 2. Set your GEMINI_API_KEY in your environment

import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.AIzaSyA8kdNYTDROBCqUdsLuji6RMC96uuUBAsI;

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in environment variables.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ AIzaSyA8kdNYTDROBCqUdsLuji6RMC96uuUBAsI });

  const config = {
    responseMimeType: 'text/plain',
  };

  const model = 'gemini-2.0-flash';
  const prompt = 'Tell me a fun fact about space.';

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      process.stdout.write(chunk.text || '');
    }
  } catch (err) {
    console.error('An error occurred while streaming content:', err);
  }
}

main();
