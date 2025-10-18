'use client'
import React from "react";
import { resetPassword } from "../actions/actions";

function ChangePassword() {
  return (
    <>
      <div>ChangePassword</div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          resetPassword(email);
        }}
      >
        <input type="email" id="email" name="email" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default ChangePassword;
