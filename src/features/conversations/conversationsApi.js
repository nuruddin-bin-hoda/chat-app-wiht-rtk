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
    getConversationById: builder.query({
      query: (id) => `/conversations/${id}`,
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

        try {
          const { data: resConversation } = await queryFulfilled;

          // add conversation in cachs
          dispatch(
            apiSlice.util.updateQueryData(
              "getConversations",
              senderEmail,
              (draft) => {
                draft.push(resConversation);
              }
            )
          );

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
        } catch (err) {
          console.log(err);
        }
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
        { sender: senderEmail, id, data },
        { queryFulfilled, dispatch }
      ) {
        //---- optimistic cache update
        const patchResult1 = dispatch(
          apiSlice.util.updateQueryData(
            "getConversations",
            senderEmail,
            (draft) => {
              const draftConversation = draft.find((c) => c.id == id);
              draftConversation.message = data.message;
              draftConversation.timestamp = data.timestamp;
            }
          )
        );

        //---- edit conversation
        const { users, message, timestamp } = data;

        try {
          const { data: resConversation } = await queryFulfilled;

          // decide sender & receiver
          const sender = users.find((u) => u.email === senderEmail);
          const receiver = users.find((u) => u.email !== senderEmail);

          // add message
          const { data: resMessage } = await dispatch(
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

          //--- pessimistic cachs updates
          dispatch(
            apiSlice.util.updateQueryData(
              "getMessages",
              resMessage.conversationId.toString(),
              (draft) => {
                draft.push(resMessage);
              }
            )
          );
        } catch (err) {
          patchResult1.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetConversationByIdQuery,
  useAddConversationMutation,
  useEditConversationMutation,
} = conversationsApi;
