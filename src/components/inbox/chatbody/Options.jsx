import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useEditConversationMutation,
  useGetConversationByIdQuery,
} from "../../../features/conversations/conversationsApi";

export default function Options() {
  const [message, setMessage] = useState("");
  const { id } = useParams();
  const { user: loggedInUser } = useSelector((state) => state.auth) || {};
  const [receiver, setReceiver] = useState({});

  const {
    data: conversation,
    isLoading,
    isSuccess,
  } = useGetConversationByIdQuery(id);

  // find receiver
  useEffect(() => {
    if (isSuccess && conversation?.users?.length > 0) {
      setReceiver(
        conversation.users.find((user) => user.email !== loggedInUser.email)
      );
    }
  }, [conversation, isSuccess, loggedInUser]);

  const [editConversation] = useEditConversationMutation();

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message !== "") {
      editConversation({
        id,
        sender: loggedInUser.email,
        data: {
          participants: `${loggedInUser.email}-${receiver.email}`,
          users: [
            loggedInUser,
            { id: receiver.id, name: receiver.name, email: receiver.email },
          ],
          message,
          timestamp: new Date().getTime(),
        },
      });

      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-center justify-between w-full p-3 border-t border-gray-300"
      autoComplete="off"
    >
      <input
        type="text"
        placeholder="Message"
        className="block w-full py-2 pl-4 mx-3 bg-gray-100 focus:ring focus:ring-violet-500 rounded-full outline-none focus:text-gray-700"
        name="message"
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button disabled={isLoading} type="submit">
        <svg
          className="w-5 h-5 text-gray-500 origin-center transform rotate-90"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </form>
  );
}
