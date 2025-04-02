import React, { useState } from 'react';
import { Layout, Form, Input, Button, message, Table, Tooltip } from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import { QRCode } from 'antd';

interface QueryResult {
  id: number;
  original_key: string;
  key: string;
  ratio: number;
  original_url: string;
  url: string;
  original_count: number[];
  secondary_count: number[];
  difference: number;
  created_at: number;
  updated_at: number;
}

export const ConfigStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<QueryResult[]>([]);
  const [form] = Form.useForm();

  const handleQuery = async (values: { key: string }) => {
    try {
      setLoading(true);
      const response = await APIClient.getConfigList({
        page: 1,
        size: 10,
        key: values.key || '',
        original_key: '',
        original_url: ''
      });
      setDataSource(response.data.configs);
    } catch (error) {
      message.error('查询失败');
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '卡密',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      ellipsis: false,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '总数',
      dataIndex: 'original_count',
      key: 'original_count',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[0] || 0
    },
    {
      title: '04-02',
      dataIndex: 'original_count',
      key: 'count_1',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[1] || 0
    },
    {
      title: '04-01',
      dataIndex: 'original_count',
      key: 'count_2',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[2] || 0
    },
    {
      title: '03-31',
      dataIndex: 'original_count',
      key: 'count_3',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[3] || 0
    },
    {
      title: '03-30',
      dataIndex: 'original_count',
      key: 'count_4',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[4] || 0
    },
    {
      title: '03-29',
      dataIndex: 'original_count',
      key: 'count_5',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[5] || 0
    },
    {
      title: '03-28',
      dataIndex: 'original_count',
      key: 'count_6',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[6] || 0
    },
    {
      title: '03-27',
      dataIndex: 'original_count',
      key: 'count_7',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => count[7] || 0
    }
  ];

  return (
    <div className={styles.container}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        className={styles.backButton}
      >
        返回
      </Button>
      <h1 className={styles.title}>客如云-统计批量查询</h1>
      <Form 
        form={form}
        className={styles.form}
        onFinish={handleQuery}
      >
        <Form.Item name="key">
          <Input.TextArea 
            placeholder="一行一个卡密，支持多个" 
            className={styles.textarea}
            rows={10}
          />
        </Form.Item>
        <div className={styles.buttonGroup}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className={`${styles.button} ${styles.primary}`}
          >
            查询
          </Button>
          <Button 
            type="primary" 
            className={`${styles.button} ${styles.secondary}`}
          >
            导出Excel
          </Button>
        </div>
      </Form>
      {dataSource.length > 0 && (
        <Table 
          columns={columns} 
          dataSource={dataSource}
          loading={loading}
          bordered
          pagination={false}
          scroll={{ y: 400, x: 'max-content' }}
          className={`${styles.table} ${styles.smallText}`}
          locale={{ emptyText: '暂无数据' }}
        />
      )}
    </div>
  );
};

export const QueryPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
    const handleGetQRCode = async (values: { key: string }) => {
      try {
        setLoading(true);
        const response = await APIClient.getUrl({
          key: values.key
        });
        setQrCodeUrl(response.data.url);
      } catch (error) {
        setQrCodeUrl('')
        console.error('获取二维码失败:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className={`${styles.container} ${styles.queryContainer}`}>
        <h1 className={`${styles.title} ${styles.queryTitle}`}>客如云-获取二维码</h1>
        <Form 
          form={form}
          className={styles.form}
          onFinish={handleGetQRCode}
        >
          <Form.Item 
            name="key"
            rules={[{ required: true, message: '请输入密钥' }]}
          >
            <Input
              placeholder="请输入密钥" 
              className={styles.input}
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className={`${styles.button} ${styles.primary} ${styles.fullWidth}`}
          >
            获取二维码
          </Button>
        </Form>
        {qrCodeUrl && (
          <div className={styles.qrCodeContainer}>
            <QRCode value={qrCodeUrl} size={200} />
            <div className={styles.qrCodeUrl}>
              {qrCodeUrl}
            </div>
          </div>
        )}
        <Button 
          type="primary" 
          className={`${styles.button} ${styles.secondary} ${styles.fullWidth}`}
          onClick={() => navigate('/statistics')}
        >
          统计批量查询
        </Button>
      </div>
    );
};
