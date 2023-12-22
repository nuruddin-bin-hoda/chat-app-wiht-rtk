import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${
          import.meta.env.VITE_CONVERSATIONS_PER_PAGE
        }`,
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantsEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantsEmail}&participants_like=${participantsEmail}-${userEmail}`,
    }),
    addConversation: builder.mutation({
      query: ({ data }) => ({
        url: `/conversations`,
        method: "POST",
        body: data,
      }),
      // add message silently
      async onQueryStarted(
        { sender: senderEmail, data },
        { queryFulfilled, dispatch }
      ) {
        const { users, message, timestamp } = data;
        const { data: resConversation } = await queryFulfilled;

        // decide sender & receiver
        const sender = users.find((u) => u.email === senderEmail);
        const receiver = users.find((u) => u.email !== senderEmail);

        // add message
        dispatch(
          messagesApi.endpoints.addMessage.initiate({
            conversationId: resConversation.id,
            sender: {
              id: sender.id,
              name: sender.name,
              email: sender.email,
            },
            receiver: {
              id: receiver.id,
              name: receiver.name,
              email: receiver.email,
            },
            message,
            timestamp,
          })
        );
      },
    }),
    editConversation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      // add message silently
      async onQueryStarted(
        { sender: senderEmail, data },
        { queryFulfilled, dispatch }
      ) {
        const { users, message, timestamp } = data;
        const { data: resConversation } = await queryFulfilled;

        // decide sender & receiver
        const sender = users.find((u) => u.email === senderEmail);
        const receiver = users.find((u) => u.email !== senderEmail);

        // add message
        dispatch(
          messagesApi.endpoints.addMessage.initiate({
            conversationId: resConversation.id,
            sender: {
              id: sender.id,
              name: sender.name,
              email: sender.email,
            },
            receiver: {
              id: receiver.id,
              name: receiver.name,
              email: receiver.email,
            },
            message,
            timestamp,
          })
        );
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationsApi;
