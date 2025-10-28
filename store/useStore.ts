'use client'
import { v4 as uuidv4 } from 'uuid';

import { create } from 'zustand'  

export type ChatStore = {
  chatObject: {
    currentChatId: string;
    isNewChat: boolean;
  };
  setChatObject: (id: string, isNewChat: boolean) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chatObject: {
    currentChatId: uuidv4(),
    isNewChat: true
  },
  setChatObject: (id: string, isNewChat: boolean) => {
    console.log('setChatObject called with:', { id, isNewChat });
    set({ 
      chatObject: { 
        currentChatId: id,
        isNewChat: isNewChat
      }
    });
    console.log('After setChatObject, store is:', get().chatObject);
  },
}));