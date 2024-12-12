
import { LoginPage } from "./app/modules/LoginPage"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { APIClient, initAPI } from "./apis/base";
import { HomePage } from "./app/modules/HomePage";
import { UserBase } from "./app/models/user"
import { useContext, useEffect, useState } from "react";
import { UserStoreContext } from "./app/globalStore/userStore";
import { LoginProtectProvider } from "./app/components/loginProtect";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginProtectProvider><HomePage /></LoginProtectProvider>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <LoginProtectProvider><HomePage /></LoginProtectProvider>,
  }
])


function App() {
  const userContext = useContext(UserStoreContext)
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  initAPI()
  useEffect(() => {
    APIClient.getUserInfo({}).then((resp) => {
      const { code } = resp 
      if (code !== 0) {
        userContext.setUser(null)
      } else {
        const {name, id} = resp.data
        const userBase: UserBase = {name, id}
        console.log(userBase)
        userContext.setUser(userBase);
      }
    }).catch(() => {
      userContext.setUser(null)
    }).finally(() => {
      setIsUserLoaded(true)
    })
  })

  if (!isUserLoaded) {
    return <div>Loading...</div>; // 显示加载状态
  }
  return (
    <RouterProvider router={router} />
  )
}

export default App
