"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SidePanel from "@/public/svg/sidePanel";
import { ChatStore, useChatStore } from "@/store/useStore";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

interface ChatsType {
  chat_uuid: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

function ChatPage() {
  const [sidePanelOut, setSidePanelOut] = useState(false);
  const [loadedChats, setLoadedChats] = useState<ChatsType[]>([]);
  const [hasMore, setHasMore] = useState(true); // Track if more chats exist
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const currentChatId = useChatStore(
    (state: ChatStore) => state.chatObject.currentChatId
  );

  const setCurrentChatObject = useChatStore(
    (state: ChatStore) => state.setChatObject
  );

  const { messages, sendMessage, setMessages } = useChat({
    id: currentChatId?.toString(), // use the provided chat ID/ load initial messages
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onData: (dataPart) => {
      // Capture the chatId from transient data
      if (dataPart.type === "data-doesChatExist") {
        const doesChatExist = (dataPart.data as { doesChatExist: boolean })
          .doesChatExist;
        const chatId = (dataPart.data as { chatId: string }).chatId;
        const title = (dataPart.data as { title: string }).title;
        console.log("does chat exist: ", doesChatExist);
        // add chat to ui
        if (!doesChatExist) {
          const newChat = {chat_uuid: chatId, user_id: "1", title: title, created_at: new Date().toISOString(), updated_at: new Date().toISOString()};  
          console.log("newchat: ",newChat)
          setLoadedChats((prevChats) => [newChat, ...prevChats]);
        }
        // if (newChatId && !currentChatId) {
        //   setCurrentChatObject(newChatId);
        //   console.log("Chat ID received:", newChatId);
        // }
      }
    },
  });

  useEffect(() => {
    const getMessages = async () => {
      try {
        setIsLoadingMessages(true);
        // Build URL with query parameters using URLSearchParams
      const params = new URLSearchParams({
        chatUUID: currentChatId,
      });

      const response = await fetch(`/api/getMessages?${params.toString()}`);;
        if (!response.ok) {
          throw new Error("Laden van berichten is mislukt");
        }
        const messages = await response.json();
        console.log("messages: ", messages);
        setMessages(messages);
      } catch (error) {
        console.error("Laden van berichten is mislukt:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    getMessages();
  }, [currentChatId]);

  useEffect(() => {
    const getChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/getChats");
        if (!response.ok) {
          throw new Error("Laden van chats is mislukt");
        }
        const chats = await response.json();
        console.log("chats: ", chats);
        
        setLoadedChats(chats);

        setHasMore(chats.length === 20); // if there are 20 chats it means there are more
      } catch (error) {
        console.error("Laden van chats is mislukt:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getChats();
  }, []);

  const loadMoreChats = async () => {
    if (loadedChats.length === 0 || isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const lastChat = loadedChats[loadedChats.length - 1];

      // Build URL with query parameters using URLSearchParams
      const params = new URLSearchParams({
        createdAt: lastChat.created_at,
        chatUUID: lastChat.chat_uuid,
        pageSize: "20",
      });

      const response = await fetch(`/api/getChats?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Laden van chats is mislukt");
      }

      const moreChats = await response.json();
      setLoadedChats([...loadedChats, ...moreChats]);

      // If we got fewer chats than the page size, there are no more
      setHasMore(moreChats.length === 20);
    } catch (error) {
      console.error("Laden van chats is mislukt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full bg-pink-mid">
      {sidePanelOut ? (
        <div className="absolute md:relative md:flex-col w-[300px] md:w-[300px] h-screen md:h-auto  flex-shrink-0 bg-pink-light z-50">
          <div className="flex justify-end p-[15px]">
            <button
              onClick={() => setSidePanelOut(!sidePanelOut)}
              className="w-[20px] overflow-hidden"
            >
              <SidePanel />
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                const newChatId = uuidv4();
                setCurrentChatObject(newChatId);
              }}
            >
              begin een nieuw gesprek
            </button>
            <div className="flex flex-col">
              {loadedChats.map((chat) => (
                <button
                  key={chat.chat_uuid}
                  onClick={() => setCurrentChatObject(chat.chat_uuid)}
                  className="p-2 hover:bg-pink-mid text-left"
                >
                  {chat.title}
                </button>
              ))}
              {hasMore && !isLoading && loadedChats.length > 0 && (
                <button
                  onClick={loadMoreChats}
                  className="p-2 text-sm text-gray-600 hover:bg-pink-mid"
                >
                  Load more...
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute md:relative md:flex-col rounded-br-[20px] md:rounded-br-[0px] w-[50px] flex-shrink-0 bg-pink-light z-50">
          <div className="flex justify-center p-[15px]">
            <button
              onClick={() => setSidePanelOut(!sidePanelOut)}
              className="w-[20px] overflow-hidden"
            >
              <SidePanel />
            </button>
          </div>
        </div>
      )}
      <ChatBox messages={messages} sendMessage={sendMessage} />
    </div>
  );
}

export default ChatPage;
