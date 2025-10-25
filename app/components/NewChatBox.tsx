import React from "react";

function NewChatBox() {
  return (
    <div className="flex flex-col bg-pink-mid  w-full items-center min-h-[100%] ">
      <div
        style={{ width: "calc(100% - 60px)" }}
        className=" max-w-[690px]  bg-pink-dark flex-1 pl-[10px] pr-[10px] pt-[10px] pb-[10px] "
      ></div>
    </div>
  );
}

export default NewChatBox;
