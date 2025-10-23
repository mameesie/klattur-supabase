'use client'
import { v4 as uuidv4 } from 'uuid';

import { create } from 'zustand'  

export type ChatStore = { // create type
chatObject: {currentChatId:string}; // object
setChatObject: (id: string) => void; // update function

};

// create store, make a different store per functionality
export const useChatStore = create<ChatStore>((set) => ({
chatObject: {currentChatId: uuidv4() },
setChatObject: (id: string) => set( { chatObject:{ currentChatId: id }}),

}));