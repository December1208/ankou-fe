import React, { useState } from 'react';
import { Form, Input, Button, message, Table, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import { QRCode } from 'antd';
import { ConfigStatisticsItem } from '../../models/ankouConfig';


export const ConfigStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ConfigStatisticsItem[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [form] = Form.useForm();

  const handleQuery = async (values: { key: string }) => {
    try {
      console.log(values)
      setLoading(true);
      const response = await APIClient.getStatistics({
        keys: values.key.split('\n').map(item => item.trim()).filter(item => item !== '')
      });
      
      // 获取所有不重复的日期
      const dates = Array.from(new Set(
        response.data.uv.flatMap(item => 
          item.uv.map(uvData => uvData.date)
        )
      )).sort();
      
      setDateColumns(dates);
      setDataSource(response.data.uv);
    } catch (error) {
      message.error('查询失败');
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    const baseColumns = [
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
        key: 'total',
        width: 100,
        render: (_: any, record: ConfigStatisticsItem) => {
          return record.uv.reduce((sum, item) => sum + item.count, 0);
        }
      }
    ];

    const dynamicColumns = dateColumns.map(date => ({
      title: date,  // 将 YYYY-MM-DD 转换为 MM/DD
      key: date,
      width: 100,
      render: (_: any, record: ConfigStatisticsItem) => {
        const uvData = record.uv.find(item => item.date === date);
        return uvData?.count || 0;
      }
    }));

    return [...baseColumns, ...dynamicColumns];
  };

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
      <h1 className={styles.title}>统计批量查询</h1>
      <Form 
        form={form}
        className={styles.form}
        onFinish={handleQuery}
      >
        <Form.Item name="key">
          <Input.TextArea 
            placeholder="一行一个卡密，最多支持20个" 
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
          columns={getColumns()} 
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
        <h1 className={`${styles.title} ${styles.queryTitle}`}>获取二维码</h1>
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
