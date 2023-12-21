import { apiSlice } from "../api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // register user
    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;

          // save accessToken & user on localStore
          localStorage.setItem(
            "auth",
            JSON.stringify({
              accessToken: res.data.accessToken,
              user: res.data.user,
            })
          );

          // save accessToken & user on redux store
          dispatch(
            userLoggedIn({
              accessToken: res.data.accessToken,
              user: res.data.user,
            })
          );
        } catch (err) {
          console.log(err);
        }
      },
    }),
    // login user
    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;

          // save accessToken & user on localStore
          localStorage.setItem(
            "auth",
            JSON.stringify({
              accessToken: res.data.accessToken,
              user: res.data.user,
            })
          );

          // save accessToken & user on redux store
          dispatch(
            userLoggedIn({
              accessToken: res.data.accessToken,
              user: res.data.user,
            })
          );
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
