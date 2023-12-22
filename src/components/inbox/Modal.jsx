import { useEffect, useState } from "react";
import isValidEmail from "../../utils/isValidEmail";
import Error from "../ui/Error";
import { useGetUserQuery } from "../../features/users/usersApi";
import { useSelector } from "react-redux";
import {
  useAddConversationMutation,
  useEditConversationMutation,
  useGetConversationQuery,
} from "../../features/conversations/conversationsApi";

/* eslint-disable react/prop-types */
export default function Modal({ open, control }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [userCheck, setUserCheck] = useState(false);
  const { user: loggedInUser } = useSelector((state) => state.auth) || {};
  const { email: loggedInUserEmail } = loggedInUser || {};
  const [conversatinCheck, setConversationCheck] = useState(false);

  const [editConversation, { isSuccess: isAddConversationSuccess }] =
    useEditConversationMutation();
  const [addConversation, { isSuccess: isEditConversationSuccess }] =
    useAddConversationMutation();

  // listen add/edit conversation success
  useEffect(() => {
    if (isAddConversationSuccess || isEditConversationSuccess) control();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddConversationSuccess, isEditConversationSuccess]);

  const { data: participent } = useGetUserQuery(to, {
    skip: !userCheck,
  });

  const { data: conversation } = useGetConversationQuery(
    { userEmail: loggedInUserEmail, participantsEmail: to },
    {
      skip: !conversatinCheck,
    }
  );

  // check conversation existancy
  useEffect(() => {
    if (participent?.length > 0 && participent[0].email !== loggedInUserEmail) {
      setConversationCheck(true);
    }
  }, [participent, loggedInUserEmail]);

  // handle debounce search
  const doSearch = (value) => {
    if (isValidEmail) {
      setTo(value);
      setUserCheck(true);
    }
  };

  const debounceSearch = (fn, delay) => {
    let timeoutId;

    return (...arg) => {
      timeoutId && clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        fn(...arg);
      }, delay);
    };
  };

  const handleSearch = debounceSearch(doSearch, 1000);

  // handle submit
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (conversation?.length > 0) {
      editConversation({
        id: conversation[0].id,
        sender: loggedInUserEmail,
        data: {
          participants: `${loggedInUserEmail}-${participent[0].email}`,
          users: [loggedInUser, participent[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    } else if (conversation?.length === 0) {
      addConversation({
        sender: loggedInUserEmail,
        data: {
          participants: `${loggedInUserEmail}-${participent[0].email}`,
          users: [loggedInUser, participent[0]],
          message,
          timestamp: new Date().getTime(),
        },
      });
    }
  };

  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form onSubmit={handleSendMessage} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                disabled={
                  participent?.length > 0 &&
                  participent[0].email === loggedInUserEmail
                }
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Send Message
              </button>
            </div>

            {participent?.length === 0 && (
              <Error message="This user dosn't exist!" />
            )}

            {participent?.length > 0 &&
              participent[0].email === loggedInUserEmail && (
                <Error message="You can't send message to yourself" />
              )}
          </form>
        </div>
      </>
    )
  );
}
