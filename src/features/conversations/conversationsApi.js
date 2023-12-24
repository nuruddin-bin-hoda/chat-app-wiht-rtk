import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";
import io from "socket.io-client";

export const conversationsApi = apiSlice.injectEndpoints({
  tagTypes: ["Conversation", "User"],
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${
          import.meta.env.VITE_CONVERSATIONS_PER_PAGE
        }`,
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // create socket
        const socket = io(import.meta.env.VITE_BASE_URL, {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttemps: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;

          socket.on("conversation", (data) => {
            updateCachedData((draft) => {
              const conversation = draft.find((c) => c.id == data?.data?.id);

              if (conversation?.id) {
                conversation.message = data?.data?.message;
                conversation.timestamp = data?.data?.timestamp;
              } else {
                const isMyConversation = data.data.users.find(
                  (u) => u.email === arg
                );

                isMyConversation?.id && draft.push(data.data);
              }
            });
          });
        } catch (err) {}

        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getConversation: builder.query({
      query: ({ userEmail, participantsEmail }) =>
        `/conversations?participants_like=${userEmail}-${participantsEmail}&participants_like=${participantsEmail}-${userEmail}`,
      providesTags: ["Conversation"],
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
      invalidatesTags: ["Conversation", "User"],
      // add message silently
      async onQueryStarted(
        { sender: senderEmail, data },
        { queryFulfilled, dispatch }
      ) {
        const { users, message, timestamp } = data;

        try {
          const { data: resConversation } = await queryFulfilled;

          // add conversation in cache
          // dispatch(
          //   apiSlice.util.updateQueryData(
          //     "getConversations",
          //     senderEmail,
          //     (draft) => {
          //       draft.push(resConversation);
          //     }
          //   )
          // );

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
          // dispatch(
          //   apiSlice.util.updateQueryData(
          //     "getMessages",
          //     resMessage.conversationId.toString(),
          //     (draft) => {
          //       draft.push(resMessage);
          //     }
          //   )
          // );
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
