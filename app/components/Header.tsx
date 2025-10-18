import { getUser } from "@/supabase/auth/server";
import LogOutButton from "./LogOutButton";
import DropDownMenu from "./DropDownMenu";
async function Header() {
  const user = await getUser();

  console.log("user: ",user);
  return (
    <div className="h-[100px] bg-white sticky top-0 flex-shrink-0 z-20">
       <div className="flex">
            <a href="/chat">Logo</a>
            <p>{user?.user_metadata?.first_name ?? user?.user_metadata?.name}</p>
            <LogOutButton />
          </div>
      {user ? (
        <DropDownMenu user={{user_metadata: {avatar_url: user.user_metadata.avatar_url, first_name: user.user_metadata.first_name, name: user.user_metadata.name}}}></DropDownMenu>
      
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/signup">Sign up</a>
        </>
      )}
    </div>
  );
}

export default Header;
