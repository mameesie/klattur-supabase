
import { getUser } from "@/supabase/auth/server";
import LogOutButton from "./LogOutButton";

async function Header() {
  const user = await getUser();

  
  console.log(user)
  return (
    <div className="h-[100px] bg-white sticky top-0 flex-shrink-0 z-10">
      {user ? (
        <div className="flex">
        <a href="/chat">Logo</a>
        <img className="h-[40px] w-[40px]" alt="Profile picture" src={user?.user_metadata?.avatar_url}></img>
        <p>{user?.user_metadata?.first_name}</p>
        <LogOutButton />
        </div>

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
