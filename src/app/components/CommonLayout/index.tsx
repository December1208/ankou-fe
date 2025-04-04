import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserStoreContext } from '../../globalStore/userStore';

const { Header, Sider, Content } = Layout;

interface CommonHeaderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({ collapsed, onCollapse }) => {
  const userContext = useContext(UserStoreContext);
  return (
    <Header className={styles.header}>
      {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: styles.trigger,
        onClick: () => onCollapse(!collapsed),
      })}
      <div className={styles.headerRight}>
        
        <span>{userContext.getUser()?.name || 'admin'}</span>
      </div>
    </Header>
  );
};

interface CommonLayoutProps {
  children: React.ReactNode;
}


export const CommonLayout: React.FC<CommonLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const location = useLocation();
  const userContext = useContext(UserStoreContext);

  useEffect(() => {
    // 根据当前路径设置选中的菜单项
    if (location.pathname === '/home') {
      setSelectedKey('1');
    } else if (location.pathname === '/account') {
      setSelectedKey('2');
    }
  }, [location.pathname]);

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
    switch (key) {
      case '1':
        navigate('/home');
        break;
      case '2':
        navigate('/account');
        break;
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider 
        width={200} 
        theme="light" 
        collapsible 
        collapsed={collapsed}
        trigger={null}
        collapsedWidth={0}
        className={styles.sider}
      >
        <div className={styles.logo} />
        <Menu 
          theme="light" 
          mode="inline" 
          selectedKeys={[selectedKey]}
          onClick={({ key }) => handleMenuClick(key)}
        >
          <Menu.Item key="1">首页</Menu.Item>
          <Menu.Item key="2">用户管理</Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ overflow: 'hidden' }}>
        <CommonHeader 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
        />
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
