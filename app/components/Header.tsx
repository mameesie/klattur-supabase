import { getUser } from "@/supabase/auth/server";
import LogOutButton from "./LogOutButton";

async function Header() {
  const user = await getUser();

  return (
    <div className="h-[100px] bg-white sticky top-0 flex-shrink-0 z-10">
      <a href="/chat">Logo</a>
      {user ? (
        <LogOutButton />
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/sign-up">Sign up</a>
        </>
      )}
    </div>
  );
}

export default Header;
