"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import Arrow from "@/public/svg/arrow";
const ChatPage = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat(); // useCHat automatically uses /api/chat as route + uses previous messages in the prompt
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    console.log(messages);
  }, [messages]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) {
      sendMessage({ text: input });
    }
    setInput("");
  };

  return (
    <div className="flex flex-col bg-gray-300 w-full items-center min-h-screen ">
      <div className="w-[60%] bg-gray-200 flex-1 pl-[20px] pr-[20px] pt-[10px] ">
        {messages.map((message) => (
          <div
            key={`${message.id}-1`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              key={message.id}
              className=" rounded-xl inline-flex overflow-hidden p-[20px] m-[10px] bg-gray-100 items-center"
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
          className="bg-white min-h-[80px] w-[67%] flex justify-center items-center rounded-tl-xl rounded-tr-xl"
        >
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
            <button
              className="bg-gray-300 w-[40px] h-[40px] rounded-[10px] flex justify-center"
              onClick={handleSubmit}
            >
              <Arrow className="h-[16x] w-[16px]"></Arrow>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
