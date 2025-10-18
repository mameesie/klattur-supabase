'use client'
import React from "react";
import { changeEmail } from "../actions/actions";

function ChangeEmail() {
  return (
    <>
      <div>Nieuw email</div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          changeEmail(email);
        }}
      >
        <input type="email" id="email" name="email" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default ChangeEmail;