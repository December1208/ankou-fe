import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter } from 'react-router-dom';


const LoginPage = lazy(() =>
  import('../modules/LoginPage').then(module => ({
    default: module.LoginPage
  }))
);
const SystemListPage = lazy(() =>
  import('../modules/NewHomePage').then(module => ({
    default: module.SystemListPage
  }))
);
const RedirectPage = lazy(() =>
  import('../modules/RedirectPage').then(module => ({
    default: module.RedirectPage
  }))
);
const AccountPage = lazy(() =>
  import('../modules/AccountPage').then(module => ({
    default: module.AccountPage
  }))
);

const StatisticsPage = lazy(() =>
  import('../modules/QueryConfigPage').then(module => ({
    default: module.ConfigStatisticsPage
  }))
);

const QueryPage = lazy(() => 
  import('../modules/QueryConfigPage').then(module => ({
    default: module.QueryPage
  }))
);

const LoadingComponent = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

const LoginProtectProvider = lazy(() =>
  import('../components/loginProtect').then(module => ({
    default: module.LoginProtectProvider
  }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
        <Suspense fallback={<LoadingComponent />}>
            <QueryPage />
        </Suspense>
    )
  },
  {
    path: '/statistics',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <StatisticsPage />
      </Suspense>
    )
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <LoginPage />
      </Suspense>
      
    )
  },
  {
    path: '/home',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <LoginProtectProvider><SystemListPage /></LoginProtectProvider>
      </Suspense>
    )
  },
  {
    path: '/account',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <LoginProtectProvider><AccountPage /></LoginProtectProvider>
      </Suspense>
    )
  },
  {
    path: '/s/:token/:md5_str',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <RedirectPage />
      </Suspense>
    )
  },

]);