import { getUser } from "@/supabase/auth/server";
import LogOutButton from "./LogOutButton";
import DropDownMenu from "./DropDownMenu";

import KlatturLogo from "@/public/svg//KlatturLogo";
async function Header() {
  const user = await getUser();

  console.log("user: ", user);
  return (
    <div className="h-[100px] bg-white sticky flex justify-between items-center top-0 flex-shrink-0 z-20">
      
        <a className="w-[100px] ml-[10px]" href="/chat"><KlatturLogo/></a>

        {user ? (
          <DropDownMenu
            avatar_url={user?.user_metadata?.avatar_url}
            first_name={
              user?.user_metadata?.first_name ?? user?.user_metadata?.name
            }
          ></DropDownMenu>
        ) : (
          <div className="flex">
            <a className="cursor-pointer" href="/login">Login</a>
            <a className="cursor-pointer mx-[10px]"  href="/signup">Aanmelden</a>
          </div>
        )}
      
    </div>
  );
}

export default Header;
