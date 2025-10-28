import Arrow from "@/public/svg/arrow";
import { ChatStore, useChatStore } from "@/store/useStore";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import BounceLoader from "react-spinners/BounceLoader";

interface props {
  userName: string;
  sendMessage: (message: { text: string }) => void;
  isStreaming: boolean;
  setIsStreaming: Dispatch<SetStateAction<boolean>>;
  beforeStreaming: boolean;
  setBeforeStreaming: Dispatch<SetStateAction<boolean>>;
}

function NewChatBox({
  userName,
  sendMessage,
  setIsStreaming,
  isStreaming,
  beforeStreaming,
  setBeforeStreaming,
}: props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const currentChatId = useChatStore(
    (state: ChatStore) => state.chatObject.currentChatId
  );
  const setCurrentChatObject = useChatStore(
    (state: ChatStore) => state.setChatObject
  );

  useEffect(() => {
    // used to not overflow textarea when there is more text

    if (textareaRef.current && containerRef.current) {
      // Reset textarea height before recalculating
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      // Adjust container height based on textarea
      containerRef.current.style.height = `${
        textareaRef.current.scrollHeight + 40
      }px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input && !isStreaming) {
      setIsStreaming(true);
      setBeforeStreaming(true);
      sendMessage({ text: input });
      setInput("");
    }
  };
  return (
    <div className="flex flex-col bg-pink-mid  w-full items-center min-h-[100%] ">
      <div
        style={{ width: "calc(100% - 60px)" }}
        className=" max-w-[690px]  bg-pink-dark flex-1 pl-[10px] pr-[10px] pt-[10px] pb-[10px] "
      >
        <div className="flex flex-col items-center h-full text-center">
          <h1 className="text-3xl max-w-[500px] mb-[30px] mt-[100px]">
            Hi {userName}, Wat is er aan de hand, waar zit je mee?
          </h1>
          <div
            ref={containerRef}
            className="bg-white min-h-[95px] w-full max-w-[500px] mx-[10px] flex justify-center items-center rounded-[20px]"
          >
            <form
              className="w-full m-[27px] flex justify-center items-center bottom-0"
              onSubmit={handleSubmit}
            >
              <textarea
                ref={textareaRef}
                className="w-full bg-white resize-none outline-none overflow-hidden mr-[20px]"
                value={input}
                placeholder="Typ hier..."
                onChange={(e) => {
                  setInput(e.currentTarget.value);
                }}
                rows={1}
              />
              <button
                className="bg-yellow-button min-w-[40px] h-[40px] rounded-[10px] flex justify-center items-center cursor-pointer"
                type="submit"
              >
                {
                  beforeStreaming ? <BounceLoader color="#ffffff" size={20} /> : <Arrow className="h-[16px] w-[16px]" />
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewChatBox;
