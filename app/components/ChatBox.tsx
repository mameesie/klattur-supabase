"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import Arrow from "@/public/svg/arrow";
import ChatAssistant from "@/public/svg/chatAssistant";
import ChatUser from "@/public/svg/chatUser";
import { UIDataTypes, UIMessage, UITools } from "ai";
import { ChatStore, useChatStore } from "@/store/useStore";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getUser } from "@/supabase/auth/server";
interface props {
  sendMessage: (message: { text: string }) => void;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  isLoadingMessages: boolean;
  userName: string
}

const ChatBox = ({ messages, sendMessage, isLoadingMessages, userName }: props) => {
  const [input, setInput] = useState("");
  const setCurrentChatObject = useChatStore(
    (state: ChatStore) => state.setChatObject
  );
  const currentChatId = useChatStore(
    (state: ChatStore) => state.chatObject.currentChatId
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  
  useEffect(() => {
    // used to not overflow textarea when there is more text

    if (textareaRef.current && containerRef.current) {
      // Reset textarea height before recalculating
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Adjust container height based on textarea
      containerRef.current.style.height = `${
        textareaRef.current.scrollHeight + 40
      }px`;
    }
  }, [input]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Check if last message is from assistant
      if (lastMessage.role === "assistant") {
        const lastPart = lastMessage.parts[lastMessage.parts.length - 1]; // Get last part

        // Check if streaming is still in progress
        if (lastPart && "state" in lastPart) {
          setIsStreaming(lastPart.state !== "done");
        }
      }
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
        {isLoadingMessages ? (
          <div className="flex flex-col p-[10px]">
            <Skeleton
              count={6}
              style={{ marginBottom: '20px' }}
              borderRadius="20px"  // Match your message bubbles

              height={70}
              baseColor="#F6EBE2" // Light pink base
              highlightColor="#ffffff" // Even lighter pink for shimmer
            />
          </div>
        ) : ( 
          <>
          <div className="flex justify-start">
            <div
              key="id-1-1"
              className=" rounded-[20px] inline-flex overflow-hidden p-[15px] m-[10px] bg-pink-light items-center"
            >
              <div
                className={`h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
              >
                <ChatAssistant/>
              </div>
              <div className="ml-[15px]">
                Hi {userName}, Wat is er aan de hand, waar zit je mee?
              </div>
            </div>
          </div>
        
        
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
                    className={` h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
                  >
                    <ChatAssistant/>
                  </div>
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
                    className={` h-[40px] w-[40px] rounded-[10px] flex-shrink-0`}
                  >
                    <ChatUser/>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
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
          {/* <button onClick={() => {
            console.log("current chat object", currentChatId)
            setCurrentChatObject(3)
            console.log("current chat object", currentChatId)
            }}>setcurrentchat object</button>
            <button onClick={() => {
            console.log("current chat object", currentChatId)
            setCurrentChatObject(4)
            console.log("current chat object", currentChatId)
            }}>setcurrentchat object</button> */}
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
