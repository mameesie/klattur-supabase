

"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import Arrow from "@/public/svg/arrow";
import { DefaultChatTransport } from "ai";
import { ChatStore, useChatStore } from "@/store/useStore";
const ChatBox = () => {
  const [input, setInput] = useState("");
  const setCurrentChatObject = useChatStore((state: ChatStore) => state.setChatObject)
  const id = useChatStore((state: ChatStore) => state.chatObject.currentChatId);
  const { messages, sendMessage } = useChat({
    id: id?.toString(), // use the provided chat ID/ load initial messages
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onData: (dataPart) => {
      // Capture the chatId from transient data
      if (dataPart.type === 'data-chatId') {
        const newChatId = (dataPart.data as { chatId: number }).chatId;
        if (newChatId && !id) {
          setCurrentChatObject(newChatId);
          console.log('Chat ID received:', newChatId);
        }
      }
    },
  }); 


  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  useEffect(() => {
    console.log("id: ",id)
  },[id])
  
  useEffect(() => {
    // used to not overflow textarea when there is more text

    if (textareaRef.current && containerRef.current) {
      // Reset textarea height before recalculating
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Adjust container height based on textarea
      containerRef.current.style.height = `${
        textareaRef.current.scrollHeight + 10
      }px`;
    }
  }, [input]);

  useEffect(() => {
    // check if the message has done status so we can setIsStreaming to false
    console.log(messages);

    // Check if the last message is from assistant and still streaming
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastPart = lastMessage.parts[1];

      // Type guard to check if it's a text part with state
      if (lastPart && "state" in lastPart && lastPart.state === "done") {
        setIsStreaming(false);
      }
    } else {
      setIsStreaming(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input && !isStreaming) {
      setIsStreaming(true);
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col bg-pink-mid  w-full items-center min-h-[100%] ">
      <div
        style={{ width: "calc(100% - 60px)" }}
        className=" max-w-[690px]  bg-pink-dark flex-1 pl-[10px] pr-[10px] pt-[10px] pb-[10px] "
      >
        {
          <div className="flex justify-start">
            <div
              key="id-1-1"
              className=" rounded-[20px] inline-flex overflow-hidden p-[15px] m-[10px] bg-pink-light items-center"
            >
              <div
                className={`bg-red-300 h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
              ></div>
              <div className="ml-[15px]">
                Hi! Wat is er aan de hand, waar zit je mee?
              </div>
            </div>
          </div>
        }
        {messages.map((message) => (
          <div
            key={`${message.id}-1`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              key={message.id}
              className=" rounded-[20px] inline-flex overflow-hidden p-[15px] m-[10px] bg-pink-light items-center"
            >
              {/* whitespace-pre-wrap */}
              {/*message.role === "user" ? "User: " : "AI: "*/}
              {message.role === "assistant" ? (
                <div
                  className={`bg-red-300 h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
                ></div>
              ) : (
                <div></div>
              )}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        className={`${
                          message.role === "user" ? "mr-[15px]" : "ml-[15px]"
                        }`}
                        key={`${message.id}-${i}`}
                      >
                        {part.text}
                      </div>
                    );
                }
              })}
              {message.role === "user" ? (
                <div
                  className={`bg-blue-300 h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
                ></div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 flex justify-center items-center w-full ">
        <div
          ref={containerRef}
          className="bg-white min-h-[95px] w-full max-w-[800px] mx-[10px] flex justify-center items-center rounded-t-[30px]"
        >
          <form
            className="w-full m-[27px] flex justify-center items-center bottom-0"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              className="w-full bg-white resize-none outline-none overflow-hidden mr-[20px]"
              value={input}
              placeholder="Typ hier..."
              onChange={(e) => {
                setInput(e.currentTarget.value);
              }}
              rows={1}
            />
            <button
              className="bg-yellow-button min-w-[40px] h-[40px] rounded-[10px] flex justify-center items-center"
              type="submit"
            >
              {isStreaming ? (
                <div className="w-[15px] h-[15px] bg-white rounded-[5px] animate-grow" />
              ) : (
                <Arrow className="h-[16px] w-[16px]" />
              )}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        @keyframes grow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        .animate-grow {
          animation: grow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
