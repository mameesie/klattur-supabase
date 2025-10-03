"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
const ChatPage = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat(); // useCHat automatically uses /api/chat as route + uses previous messages in the prompt
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
    if (textareaRef.current && containerRef.current) {
      // Reset textarea height before recalculating
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Adjust container height based on textarea
      containerRef.current.style.height = `${textareaRef.current.scrollHeight + 10}px`;
    }
  }, [input]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col bg-gray-300 w-full items-center min-h-screen">
      <div className="w-[60%] flex flex-col items-center bg-gray-200">
        <div className="w-[90%] bg-gray-200 flex-1">
          {messages.map((message) => (
            <div key={message.id} className="whitespace-pre-wrap">
              {message.role === "user" ? "User: " : "AI: "}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                }
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 flex justify-center items-center w-full ">
        <div 
          ref={containerRef}
        className="bg-white min-h-[80px] w-[70%] flex justify-center items-center rounded-tl-xl rounded-tr-xl">
          <form
            className="w-[95%] flex justify-center items-center bottom-0"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              className="w-[100%] bg-white resize-none outline-none overflow-hidden"
              value={input}
              placeholder="Typ hier..."
              onChange={(e) => {
    setInput(e.currentTarget.value);

   
  }}
              rows={1}
            />
            <button className="text-black" onClick={handleSubmit}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
