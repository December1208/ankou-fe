
import { LoginPage } from "./app/modules/LoginPage"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { initAPI } from "./apis/base";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  }
])


function App() {
  initAPI()
  return (
    <RouterProvider router={router} />
  )
}

export default App
