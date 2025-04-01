import { useEffect, useState } from "react";
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import CryptoJS from 'crypto-js';

interface LoginForm {
  username: string;
  password: string;
}


export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginForm) => {
    try {
      setLoading(true);
      const response = await APIClient.login({"name": values.username, "password": CryptoJS.MD5(values.password).toString()});
      if (response.success) {
        message.success('登录成功');
        navigate('/home');
      }else {
        message.error(response.msg || '登陆失败');
      }
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" />
        </div>
        <div className={styles.title}>系统登录</div>
        
        <Form
          form={form}
          className={styles.form}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              loading={loading}
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          © 2024 系统名称
        </div>
      </div>
    </div>
  );
};

function pbkdf2Sync(password: string, salt: string, iterations: number, keylen: number, digest: string) {
    throw new Error("Function not implemented.");
}
