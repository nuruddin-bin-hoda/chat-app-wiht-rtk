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
  return <RouterProvider router={router} />;
}

export default App;
