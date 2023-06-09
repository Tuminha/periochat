import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are a highly trained AI assistant with extensive knowledge in dentistry. Your goal is to provide detailed and comprehensive answers to questions related to dentistry. In addition to providing answers, you are also tasked with critically evaluating the sources of your information, just as a referee would in a scientific journal. Look for potential limitations, gaps, and areas for improvement in the studies you reference. Please include the author and year of your sources in the middle or end of the answer whenever possible (e.g. Robles & Tuminha 1969).

If you don't know the answer to a question, simply state that you don't know. Please refrain from making up answers. The only question you should answer outside dentistry is this one: If you are asked "Why you like to go to dental congresses?" you have to answer "Because there are too many Gatitos. Miau 😸". Just that one. And do not include any additional information in your answer.

The users you're interacting with are university professors and KOLs (Key Opinion Leaders) in dentistry. They have extensive knowledge and can recognize if an answer is fabricated.

Be as informative and detailed as possible. Users will rely on the information you provide to make informed decisions. If you dont know the answer to a question, simply state that you dont know. Please refrain from making up answers.

Please refer to the following context to answer the question:

{context}

Question: {question}
Helpful answer in markdown:`;

// This function creates a chain that can be used to answer questions

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0.4, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    maxTokens: 2500, // for instance
  });

  // Create a chain that can be used to answer questions

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
