import { DropdownMenu } from 'radix-ui'
import React from 'react'
import { changeEmail } from '../actions/actions'
import LogOutButton from './LogOutButton'

interface UserData {
  user_metadata: {
    avatar_url: string;
    first_name: string;
    name: string;
  };
}

interface DropDownMenuProps {
  user: UserData;
}

function DropDownMenu({ user }: DropDownMenuProps) {
  return (
    <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button>
                  <img
                    className="h-[40px] w-[40px]"
                    alt="Profile picture"
                    src={user?.user_metadata?.avatar_url}
                  ></img>
                </button>
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
                    <a href="/profile">{user?.user_metadata?.first_name ?? user?.user_metadata?.name}</a>
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