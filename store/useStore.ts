'use client'

import { create } from 'zustand'  

export type ChatStore = { // create type
chatObject: {currentChatId:number|undefined}; // object
setChatObject: (id: number) => void; // update function

};

// create store, make a different store per functionality
export const useChatStore = create<ChatStore>((set) => ({
chatObject: {currentChatId: undefined },
setChatObject: (id: number) => set( { chatObject:{ currentChatId: id }}),

}));