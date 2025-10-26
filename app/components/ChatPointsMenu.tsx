import Points from '@/public/svg/points'
import { DropdownMenu } from 'radix-ui'
import React from 'react'

function ChatPointsMenu() {
  return (
    <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className='w-[20px] cursor-pointer mb-[2px]'><Points/></div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="z-50 min-w-[220px] min-h-[400px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                  <DropdownMenu.Item>
                    <button>
                      delete
                    </button>
                  </DropdownMenu.Item>
    
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>

  )
}

export default ChatPointsMenu