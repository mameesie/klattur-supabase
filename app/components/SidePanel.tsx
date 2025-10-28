"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import ChatBox from "./ChatBox";
import SidePanelButton from "@/public/svg/sidePanelButton";
import { ChatStore, useChatStore } from "@/store/useStore";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import "@/app/globals.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import NewChat from "@/public/svg/newChat";
import NewChatBox from "./NewChatBox";
import PulseLoader from "react-spinners/PulseLoader";
import ChatPointsMenu from "./ChatPointsMenu";

interface ChatsType {
  chat_uuid: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface props {
  userName: string;
}

function SidePanel({ userName }: props) {
  const [sidePanelOut, setSidePanelOut] = useState(false);
  const [loadedChats, setLoadedChats] = useState<ChatsType[]>([]);
  const [selectDeleteChat, setSelectDeleteChat] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true); // Track if more chats exist
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [beforeStreaming, setBeforeStreaming] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentChatId = useChatStore(
    (state: ChatStore) => state.chatObject.currentChatId
  );
  const isNewChat = useChatStore(
    (state: ChatStore) => state.chatObject.isNewChat
  );

  const setCurrentChatObject = useChatStore(
    (state: ChatStore) => state.setChatObject
  );

  const { messages, sendMessage, setMessages } = useChat({
    id: currentChatId?.toString(), // use the provided chat ID/ load initial messages

    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
        console.log("🔥 prepareSendMessagesRequest CALLED");
        const isnewchat = useChatStore.getState().chatObject.isNewChat;
        console.log("isNewChat: ", isnewchat);

        return {
          body: {
            id,
            messages,
            trigger,
            messageId,
            isNewChat: isnewchat,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setBeforeStreaming(false);
      // Capture the chatId from transient data
      if (dataPart.type === "data-doesChatExist") {
        const doesChatExist = (dataPart.data as { doesChatExist: boolean })
          .doesChatExist;
        const chatId = (dataPart.data as { chatId: string }).chatId;
        const title = (dataPart.data as { title: string }).title;
        console.log("does chat exist: ", doesChatExist);
        // add chat to ui
        if (!doesChatExist) {
          const newChat = {
            chat_uuid: chatId,
            user_id: "1",
            title: title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          console.log("newchat: ", newChat);
          setLoadedChats((prevChats) => [newChat, ...prevChats]);
          setCurrentChatObject(chatId, false)
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
        // // Check if this is a new bc it is not in loadedChats yet
        // const isNewChat = !loadedChats.some(
        //   (chat) => chat.chat_uuid === currentChatId
        // );
        if (isNewChat) {
          setMessages([]); // Clear messages for new chat
          return;
        }
        //setIsLoadingMessages(true);
        // Build URL with query parameters using URLSearchParams
        const params = new URLSearchParams({
          chatUUID: currentChatId,
        });

        const response = await fetch(`/api/getMessages?${params.toString()}`);
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
      setIsLoadingMore(true);
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
      setIsLoadingMore(false);
    }
  };

  // Helper function to show what date the chat was created
  function formatDate(dateString: string): string {
    console.log("dateString: ", dateString);
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare using local date strings (YYYY-MM-DD format)
    const dateStr = date.toLocaleDateString("en-CA"); // ISO format YYYY-MM-DD
    const todayStr = today.toLocaleDateString("en-CA");
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    if (dateStr === todayStr) {
      return "Vandaag";
    } else if (dateStr === yesterdayStr) {
      return "Gisteren";
    } else {
      return date.toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  function groupChatsByDate(chats: ChatsType[]) {
    const groups: { [key: string]: ChatsType[] } = {};

    chats.forEach((chat) => {
      const date = new Date(chat.created_at);
      const dateKey = date.toLocaleDateString("en-CA"); // Use ISO format as key
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });

    return groups;
  }

  function deleteChat(chatId: string) {}

  return (
    <div className="flex min-h-full bg-pink-mid">
      {sidePanelOut ? (
        <div className="absolute md:flex-col w-[300px] h-[calc(100vh-100px)] flex-shrink-0 bg-pink-light z-50">
          <div className="flex justify-end p-[15px]">
            <button
              onClick={() => setSidePanelOut(!sidePanelOut)}
              className="w-[20px] overflow-hidden cursor-pointer"
            >
              <SidePanelButton />
            </button>
          </div>

          <button
            className="cursor-pointer flex justify-start ml-[20px] items-center mb-[30px]"
            onClick={() => {
              const newChatId = uuidv4();
              setCurrentChatObject(newChatId, true);
              setSelectedChat(newChatId);
            }}
          >
            <div className=" w-[20px]">
              <NewChat />
            </div>

            <p className="ml-[5px]">Nieuw gesprek</p>
          </button>

          <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-230px)]">
            {isLoading ? (
              <Skeleton
                style={{ marginLeft: "10px" }}
                width={280}
                count={18}
                height={35}
                borderRadius="20px"
                baseColor="#F3DFD2"
                highlightColor="#F6EBE2"
              />
            ) : (
              Object.entries(groupChatsByDate(loadedChats)).map(
                ([dateKey, chats]) => (
                  <div key={dateKey}>
                    <div className="pl-[20px] pt-[10px] pb-[5px] font-semibold">
                      {formatDate(chats[0].created_at)}
                    </div>
                    {chats.map((chat) => (
                      <div key={`i-${chat.chat_uuid}`} className="flex">
                        <div
                          className="ml-[10px] rounded-[7px] inline-block px-[10px] trigger-button hover:bg-pink-mid"
                          key={`div-${chat.chat_uuid}`}
                        >
                          <button
                            key={chat.chat_uuid}
                            onClick={() => {
                              setSelectedChat(chat.chat_uuid);
                              setCurrentChatObject(chat.chat_uuid, false);
                              if (chat.chat_uuid !== currentChatId) {
                                setIsLoadingMessages(true);
                              }
                            }}
                            className={`${
                              selectedChat === chat.chat_uuid
                                ? "bg-pink-mid px-[10px] ml-[-10px] rounded-[7px]"
                                : ""
                            } max-w-[280px] overflow-x-hidden whitespace-nowrap  pr-[10px] py-[5px] cursor-pointer text-left`}
                          >
                            {chat.title}
                          </button>
                          <div
                            className={`inline-block ${
                              selectDeleteChat !== chat.chat_uuid &&
                              "hidden-button"
                            }`}
                          >
                            <ChatPointsMenu
                              chatId={chat.chat_uuid}
                              loadedChats={loadedChats}
                              setLoadedChats={setLoadedChats}
                              setSelectDeleteChat={setSelectDeleteChat}
                              showDeleteConfirm={showDeleteConfirm}
                              setShowDeleteConfirm={setShowDeleteConfirm}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
            {hasMore && !isLoading && loadedChats.length > 0 && (
              <div className="flex justify-begin">
                <button
                  onClick={loadMoreChats}
                  className="p-2 hover:bg-pink-dark bg-pink-mid cursor-pointer rounded-[7px] ml-[10px] w-[100px]"
                >
                  {isLoadingMore ? (
                    <PulseLoader color="#ffffff" size={5} />
                  ) : (
                    <p>Laad meer</p>
                  )}
                </button>
              </div>
            )}
          </div>
          <p className="absolute bottom-2 text-[12px] ml-[20px] mt-[6px] ">
            &#169; The Work by Byron Katie
          </p>
        </div>
      ) : (
        // VV show when sidePanel is closed
        <div className="absolute md:h-[calc(100vh-100px)] rounded-br-[20px] md:rounded-br-[0px] w-[50px] flex-shrink-0 bg-pink-light z-50">
          <div className="flex justify-center p-[15px]">
            <button
              onClick={() => setSidePanelOut(!sidePanelOut)}
              className="w-[20px] overflow-hidden cursor-pointer"
            >
              <SidePanelButton />
            </button>
          </div>
        </div>
      )}
      <div
        className={`${sidePanelOut ? "md:min-w-[300px]" : "md:min-w-[50px]"} `}
      ></div>

      {isNewChat ? (
        <NewChatBox
          userName={userName}
          sendMessage={sendMessage}
          setIsStreaming={setIsStreaming}
          isStreaming={isStreaming}
          beforeStreaming={beforeStreaming}
          setBeforeStreaming={setBeforeStreaming}
        />
      ) : (
        <ChatBox
          beforeStreaming={beforeStreaming}
          setBeforeStreaming={setBeforeStreaming}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          isLoadingMessages={isLoadingMessages}
          messages={messages}
          sendMessage={sendMessage}
          userName={userName}
        />
      )}
    </div>
  );
}

export default SidePanel;
