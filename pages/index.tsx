import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export type Message = {
  type: 'userMessage' | 'apiMessage' | 'loadingMessage',
  message: string,
  sourceDocs?: Document[],
};

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about Dentistry?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    // Add the user's question to the message list
    const question = query.trim();

    setMessageState((state) => {
      const updatedMessages = [...state.messages];
      
      // Remove any consecutive user messages before adding the new user message
      while (
        updatedMessages.length > 0 &&
        updatedMessages[updatedMessages.length - 1].type === 'userMessage'
      ) {
        updatedMessages.pop();
      }
      
      updatedMessages.push({
        type: 'userMessage',
        message: question,
      });
    
      updatedMessages.push({
        type: 'apiMessage',
        message: '', // Set an empty message for the bot's response
      });
    
      return {
        ...state,
        messages: updatedMessages,
      };
    });
    

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => {
          const updatedMessages = state.messages.filter(message => message.type !== 'loadingMessage'); // Remove loading message
          return {
            ...state,
            messages: [
              ...updatedMessages,
              {
                type: 'apiMessage',
                message: data.text,
                sourceDocs: data.sourceDocuments,
              },
            ],
            history: [...state.history, [question, data.text]],
          };
        });
      }
      console.log('messageState', messageState);
  
      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }

   
    
    


  };

  return (
    <>
      <Layout>
      
      

        <div className="mx-auto flex flex-col gap-4 bg-black">
          <h1 className="heading" style={{ color: '#ffffff', textAlign: 'center' }}>
            Chat with Spot Mentor
          </h1>
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/Periospot logo.png"
                        alt="AI"
                        width="60"
                        height="60"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                    } else if (message.type === 'loadingMessage') {
                      icon = <div className={styles.loadingwheel}><LoadingDots color="#fffff" /></div>;
                      className = styles.loadingmessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/Periospot user.png"
                        alt="Me"
                        width="60"
                        height="60"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // Determine the class based on loading state and message index
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting // Apply the waiting animation class for the latest user message
                        : styles.usermessage; // Apply the default class for user messages
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.sourceDocs && (
                          <div className="p-5" key={`sourceDocsAccordion-${index}`}>
                            <Accordion type="single" collapsible className="flex-col">
                              {message.sourceDocs.slice(0, 1).map((doc, index) => (
                                <div key={`messageSourceDocs-${index}`}>
                                  <AccordionItem value={`item-${index}`}>
                                    <AccordionTrigger>
                                      <h3 className="text-white">Source {index + 1}</h3>
                                    </AccordionTrigger>
                                    <AccordionContent className="accordion-content text-white">
                                      <ReactMarkdown linkTarget="_blank">
                                        {doc.pageContent}
                                      </ReactMarkdown>
                                      <p className="mt-2" style={{ color: "#ffffff" }}>
                                      <b>Source:</b> {doc.metadata.source.startsWith("Source: /Users/") ? "" : doc.metadata.source}
                                      </p>
                                    </AccordionContent>
                                  </AccordionItem>
                                </div>
                              ))}
                            </Accordion>
                          </div>
                        )}

                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'What do you want to learn?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#fffff" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
        <footer className="m-auto p-4 text-center color bg-transparent" style={{ color: '#ffffff' }} >
          <a href="https://twitter.com/periospot">
            Powered by Periospot.ai 2023 (Twitter: @Periospot).
          </a>
        </footer>
      
      </Layout>
    </>
  );
}
