import { apiSlice } from "../api/apiSlice";

const usersApi = apiSlice.injectEndpoints({
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (email) => `/users?email=${email}`,
      providesTags: ["User"],
    }),
  }),
});

export const { useGetUserQuery } = usersApi;
