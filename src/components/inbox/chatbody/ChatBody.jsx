// import Blank from "./Blank";
import { useParams } from "react-router-dom";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";
import { useGetMessagesQuery } from "../../../features/messages/messagesApi";
import Error from "../../ui/Error";

export default function ChatBody() {
  const { id } = useParams();
  const {
    data: messages,
    isLoading,
    isError,
    isSuccess,
  } = useGetMessagesQuery(id);

  // decide what to render
  let content = null;

  if (isLoading) content = <h3>Loading...</h3>;

  if (isError) content = <Error message="Theer was an error!" />;

  if (messages?.length === 0) content = <h3>No messages found!</h3>;

  if (isSuccess && messages?.length > 0)
    content = (
      <>
        <ChatHead message={messages[0]} />
        <Messages messages={messages} />
        <Options />
      </>
    );

  return (
    <div className="w-full lg:col-span-2 lg:block">
      <div className="w-full grid conversation-row-grid">{content}</div>
    </div>
  );
}
