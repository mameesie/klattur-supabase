'use client'
import React from "react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SidePanel from "@/public/svg/sidePanel";


function ChatPage() {
  const [sidePanelOut, setSidePanelOut] = useState(false);


  return (
  <div className="flex h-full">
    {sidePanelOut ? (
      <div className="absolute md:relative md:flex-col w-[300px] md:w-[300px] h-screen md:h-auto  flex-shrink-0 bg-pink-light z-50">
        <div className="flex justify-end p-[15px]">
          <button 
            onClick={() => setSidePanelOut(!sidePanelOut)}
            className="w-[20px] overflow-hidden">
            <SidePanel />
          </button>
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
