'use client'

import { create } from 'zustand'  

export type ChatStore = { // create type
chatObject: {currentChatId:string|undefined}; // object
setChatObject: (id: string) => void; // update function

};

// create store, make a different store per functionality
export const useChatStore = create<ChatStore>((set) => ({
chatObject: {currentChatId: undefined },
setChatObject: (id: string) => set( { chatObject:{ currentChatId: id }}),

}));