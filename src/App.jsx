import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import useAuthCheck from "./hooks/useAuthCheck";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <PrivateRoute>
            <Conversation />
          </PrivateRoute>
        }
      />
      <Route
        path="/inbox/:id"
        element={
          <PrivateRoute>
            <Inbox />
          </PrivateRoute>
        }
      />
    </>
  )
);

function App() {
  const authChecked = useAuthCheck();

  if (authChecked) return <RouterProvider router={router} />;
  else return <h1>Checking authorization...</h1>;
}

export default App;
