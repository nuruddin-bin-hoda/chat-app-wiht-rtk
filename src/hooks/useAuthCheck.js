import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "../features/auth/authSlice";

export default function useAuthCheck() {
  const [authChecked, setAuthChecked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const localAuth = localStorage.getItem("auth");
    const auth = JSON.parse(localAuth);

    if (auth?.accessToken && auth?.user) {
      // set accessToken & user to redux store
      dispatch(
        userLoggedIn({
          accessToken: auth.accessToken,
          user: auth.user,
        })
      );
    }

    setAuthChecked(true);
  }, [dispatch]);

  return authChecked;
}
