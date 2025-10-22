'use client'
import React from "react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SidePanel from "@/public/svg/sidePanel";
import { ChatStore, useChatStore } from "@/store/useStore";
import { v4 as uuidv4 } from 'uuid';


function ChatPage() {
  const [sidePanelOut, setSidePanelOut] = useState(false);
  const setCurrentChatObject = useChatStore(
      (state: ChatStore) => state.setChatObject
    );


  return (
  <div className="flex min-h-full bg-pink-mid">
    {sidePanelOut ? (
      <div className="absolute md:relative md:flex-col w-[300px] md:w-[300px] h-screen md:h-auto  flex-shrink-0 bg-pink-light z-50">
        <div className="flex justify-end p-[15px]">
          <button 
            onClick={() => setSidePanelOut(!sidePanelOut)}
            className="w-[20px] overflow-hidden">
            <SidePanel />
          </button>
        </div>
        <div>
          <button onClick={() => {
            const newChatId = uuidv4()
            setCurrentChatObject(newChatId)
          }}>begin een nieuw gesprek</button>
        </div>
      </div>
    ) : (
      <div className="absolute md:relative md:flex-col rounded-br-[20px] md:rounded-br-[0px] w-[50px] flex-shrink-0 bg-pink-light z-50">
        <div className="flex justify-center p-[15px]">
          <button
            onClick={() => setSidePanelOut(!sidePanelOut)}
            className="w-[20px] overflow-hidden">
            <SidePanel />
          </button>
        </div>
      </div>
    )}
    <ChatBox />
  </div>
);
}

export default ChatPage;
