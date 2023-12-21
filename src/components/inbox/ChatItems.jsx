import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment";
import getPartnerInfo from "../../utils/getPratnerInfo";
import gravatarUrl from "gravatar-url";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth) || {};
  const { email } = user || {};
  const {
    data: conversations,
    isLoading,
    isError,
    isSuccess,
  } = useGetConversationsQuery(email);

  // decite what to render
  let content = null;

  if (isLoading)
    content = (
      <li>
        <h3>Loading...</h3>
      </li>
    );

  if (isError) content = <Error message="Can't get conversations!" />;

  if (isSuccess)
    content = conversations.map((conversation) => {
      const { id, users, message, timestamp } = conversation;
      const { name, email: partnerEmail } = getPartnerInfo(users, email);
      const avatarUrl = gravatarUrl(partnerEmail);

      return (
        <li key={id}>
          <ChatItem
            id={id}
            avatar={avatarUrl}
            name={name}
            lastMessage={message}
            lastTime={moment(timestamp).fromNow()}
          />
        </li>
      );
    });

  return <ul>{content}</ul>;
}
