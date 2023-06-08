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
