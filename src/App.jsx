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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/inbox" element={<Conversation />} />
      <Route path="/inbox/:id" element={<Inbox />} />
    </>
  )
);

function App() {
  const authChecked = useAuthCheck();

  if (authChecked) return <RouterProvider router={router} />;
  else return <h1>Checking authorization...</h1>;
}

export default App;
