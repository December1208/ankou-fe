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

import {  Button, Modal, Form, Input, message } from 'antd';
import CryptoJS from 'crypto-js';
import { APIClient } from '../../../apis/base';
import { USER_ROLES } from '../../constants';

export const CommonHeader: React.FC<CommonHeaderProps> = ({ collapsed, onCollapse }) => {
  const userContext = useContext(UserStoreContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      setLoading(true);
      await APIClient.editSelfInfo({
        old_password: CryptoJS.MD5(values.oldPassword).toString(),
        new_password: CryptoJS.MD5(values.newPassword).toString()
      });
      message.success('密码修改成功');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    userContext.setUser(null);
    APIClient.logout();
    navigate('/login');
  };

  return (
    <Header className={styles.header}>
      {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: styles.trigger,
        onClick: () => onCollapse(!collapsed),
      })}
      <div className={styles.headerRight}>
        <span style={{ marginRight: 16 }}>{"账号名: " + userContext.getUser()?.name || '未登录'}</span>
        <Button type="link" onClick={() => setIsModalVisible(true)}>修改密码</Button>
        <Button type="link" onClick={handleLogout}>退出登录</Button>
      </div>

      <Modal
        title="修改密码"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePassword}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
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
        <div className={styles.logo}>
            <img src="../../public/logo.png" alt="Logo" />
        </ div>
        <Menu 
          theme="light" 
          mode="inline" 
          selectedKeys={[selectedKey]}
          onClick={({ key }) => handleMenuClick(key)}
        >
          <Menu.Item key="1">首页</Menu.Item>
          {userContext.getUser()?.role === USER_ROLES.ADMIN && (
            <Menu.Item key="2">用户管理</Menu.Item>
          )}
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
