import { PineconeClient } from '@pinecone-database/pinecone';

// This function is exported so it can be imported in other files
export async function initPinecone() {
  const PINECONE_ENVIRONMENT = 'us-east-1-aws';
  const PINECONE_API_KEY = '4d940a59-e43b-4147-9dfe-5362b5ae7f80';
  const OPENAI_API_KEY = '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';

  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY,
    });

    return pinecone;
  } catch (error) {
    console.log('Error initializing Pinecone Client:', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}
