import Points from '@/public/svg/points'
import TrashCan from '@/public/svg/trashCan'
import { DropdownMenu } from 'radix-ui'
import React from 'react'

interface props {
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>
}

function ChatPointsMenu({ setShowDeleteConfirm }: props) {
  

return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className='w-[20px] cursor-pointer mb-[2px]'><Points/></div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="z-50 min-w-[132px] min-h-[52px] rounded-[10px] bg-white p-[5px]">
            <DropdownMenu.Item className='mt-[8px]'>
              <button onClick={() => setShowDeleteConfirm(true)} className='flex ml-[5px] cursor-pointer text-red-900'>
                <TrashCan className='w-[18px] h-[18px] mt-[2px] mr-[10px] ml-[4px]'/>
                <p>Verwijder</p>
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

    
    </>
  )
}

export default ChatPointsMenu