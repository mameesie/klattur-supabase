
import Points from '@/public/svg/points'
import TrashCan from '@/public/svg/trashCan'
import { DropdownMenu } from 'radix-ui'
import React from 'react'
interface ChatsType {
  chat_uuid: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}


interface props {
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>
  showDeleteConfirm: boolean
  setLoadedChats: React.Dispatch<React.SetStateAction<ChatsType[]>>
  loadedChats: ChatsType[]
  setSelectDeleteChat: React.Dispatch<React.SetStateAction<string | undefined>>
  chatId: string
}

function ChatPointsMenu({ setShowDeleteConfirm, setLoadedChats, setSelectDeleteChat, showDeleteConfirm, chatId }: props) {
  
  const deleteChat = async () => {
    // optimistic delete chat from UI
    setLoadedChats((prevChats) => prevChats.filter((chat) => chat.chat_uuid !== chatId));
    try {
      const response = await fetch("/api/delete-chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      }); 

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Registration failed");
      }

    } catch (error) {
      console.error("Laden van chats is mislukt:", error);
    }
  }

return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className='w-[20px] cursor-pointer mb-[2px]'><Points/></div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="z-50 min-w-[132px] min-h-[52px] rounded-[10px] bg-white p-[5px]">
            <DropdownMenu.Item className='mt-[8px]'>
              <button onClick={() => {
                setSelectDeleteChat(chatId)
                setShowDeleteConfirm(true)
                }} className='flex ml-[5px] cursor-pointer text-red-900'>
                <TrashCan className='w-[18px] h-[18px] mt-[2px] mr-[10px] ml-[4px]'/>
                <p>Verwijder</p>
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

    {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black-opacity bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-pink-light rounded-[20px] p-6 max-w-sm mx-4">
            <p className="mb-4">Weet je zeker dat je dit gesprek wilt verwijderen?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setSelectDeleteChat(null)
                  setShowDeleteConfirm(false)

                }}
                className="px-4 py-2 rounded-[10px] bg-pink-mid hover:bg-pink-dark cursor-pointer"
              >
                Annuleren
              </button>
              <button 
                onClick={() => {
                  // Add your delete logic here
                  setSelectDeleteChat(null)
                  setShowDeleteConfirm(false);
                  deleteChat();
                }}
                className="px-4 py-2 rounded-[10px] bg-pink-mid hover:bg-pink-dark cursor-pointer"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatPointsMenu