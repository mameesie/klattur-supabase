'use client'
import React from "react";
import { changePassword } from "@/app/actions/actions";

function ChangePassword() {
  return (
    <>
      <div>ChangePassword</div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const password = formData.get("password") as string;
          changePassword(password);
        }}
      >
        <input type="password" id="password" name="password" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default ChangePassword;
