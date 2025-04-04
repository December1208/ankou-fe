import { LoginPage } from "./app/modules/LoginPage"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { initAPI } from "./apis/base";
import { useEffect } from "react";
import { AdminProtectProvider, LoginProtectProvider } from "./app/components/loginProtect";
import { SystemListPage } from "./app/modules/NewHomePage";
import { ConfigStatisticsPage, QueryPage } from "./app/modules/QueryConfigPage";
import { RedirectPage } from "./app/modules/RedirectPage";
import { getOrCreateSessionId } from "./utils/session";
import { AccountPage } from "./app/modules/AccountPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <QueryPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <LoginProtectProvider> <SystemListPage /></LoginProtectProvider>
  },
  {
    path: "/account",
    element: <AdminProtectProvider><AccountPage /></AdminProtectProvider>,
  },
  {
    path: "/statistics",
    element: <ConfigStatisticsPage />,
  },
  {
    path: "/s/:token/:md5_str",
    element: <RedirectPage />,
  }
])

function App() {

  useEffect(() => {
    // 在应用启动时处理 sessionId
    getOrCreateSessionId();
  }, []);

  initAPI()
  return (
    <RouterProvider router={router} />
  )
}

export default App
