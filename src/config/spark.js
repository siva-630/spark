import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration for Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Models confirmed for this API key (ordered by preference)
const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
const defaultModel = import.meta.env.VITE_GEMINI_MODEL || fallbackModels[0];

function isModelUnavailableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('is not found') || message.includes('not supported for generatecontent') || message.includes('[404');
}

async function runWithModelFallback(requestedModel, requestFn) {
  const modelsToTry = [requestedModel, ...fallbackModels.filter((m) => m !== requestedModel)];
  let lastError;

  for (const currentModel of modelsToTry) {
    try {
      return await requestFn(currentModel);
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
      console.warn(`Model \"${currentModel}\" unavailable, trying fallback model...`);
    }
  }

  throw lastError;
}

// Function to generate content using Gemini
async function generateContent(prompt, model = defaultModel) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server.');
  }

  try {
    return await runWithModelFallback(model, async (activeModel) => {
      const geminiModel = genAI.getGenerativeModel({ model: activeModel });
      const result = await geminiModel.generateContentStream(prompt);
      let fullResponse = '';

      for await (const chunk of result.stream) {
        const text = chunk.text() || '';
        fullResponse += text;
      }

      return fullResponse;
    });
  } catch (err) {
    console.error('An error occurred while generating content:', err);
    throw err;
  }
}

// Function to generate content without streaming (returns full response)
async function generateContentSync(prompt, model = defaultModel) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server.');
  }

  try {
    return await runWithModelFallback(model, async (activeModel) => {
      const geminiModel = genAI.getGenerativeModel({ model: activeModel });
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });
  } catch (err) {
    console.error('An error occurred while generating content:', err);
    throw err;
  }
}

// Function to start a chat session
function startChat(model = defaultModel) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server.');
  }

  const geminiModel = genAI.getGenerativeModel({ model: fallbackModels.includes(model) ? model : defaultModel });
  return geminiModel.startChat();
}

// Export functions for use in other modules
export { generateContent, generateContentSync, startChat, genAI, defaultModel };
