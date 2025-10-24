import { DropdownMenu } from 'radix-ui'
import React from 'react'
import { changeEmail } from '../actions/actions'
import LogOutButton from './LogOutButton'
import ChatUser from '@/public/svg/chatUser';

interface UserData {
  avatar_url: string;
  first_name: string;
  
  
}



function DropDownMenu({ avatar_url, first_name }: UserData) {
  return (
    <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className='mr-[20px]'>
                  <button className='bg-pink-light w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-pointer'>
                    <div className='w-[40px] h-[40px]'>
                      <ChatUser/>
                    </div>
                  </button>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="z-50 min-w-[220px] min-h-[400px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                  <DropdownMenu.Item>
                    <a href="/profile">Profile</a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item>
                    <LogOutButton />
                  </DropdownMenu.Item>
                 <DropdownMenu.Item>
                    <a href="/profile">{first_name}</a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <a href="/change-password" >Verander wachtwoord</a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <a href='/change-email' >Verander emailadres</a>
                  </DropdownMenu.Item>
                  
    
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
    
             
            </DropdownMenu.Root>
  )
}

export default DropDownMenu