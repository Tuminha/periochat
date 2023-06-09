import { PineconeClient } from '@pinecone-database/pinecone';

// This function is exported so it can be imported in other files
export async function initPinecone() {
  const PINECONE_ENVIRONMENT = 'us-east-1-aws';
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!PINECONE_API_KEY || !OPENAI_API_KEY) {
    throw new Error('Environment variables PINECONE_API_KEY and OPENAI_API_KEY must be set');
  }


  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY,
    });

    return pinecone;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as any;
      if (axiosError.isAxiosError && axiosError.response) {
        console.log('Axios Error:', axiosError.response.data);
      } else {
        console.log('Error:', error.message);
      }
      throw new Error('Failed to ingest your data: ' + error.message);
    } else {
      console.log('An unknown error occurred');
      throw error;
    }
  }
  
}
