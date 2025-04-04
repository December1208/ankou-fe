import React, { useEffect, useState } from 'react';
import { Table, Form, Input, Button, Space, message, Modal, Layout } from 'antd';
import { 
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { AccountItem, QueryParams, NewAccountForm, UpdateAccountForm } from '../../models/user';
import { CommonLayout } from '../../components/CommonLayout';
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import CryptoJS from 'crypto-js';

const { Content } = Layout;

export const AccountPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<AccountItem[]>([]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAccountForm] = Form.useForm<NewAccountForm>();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AccountItem | null>(null);
  const [updateAccountForm] = Form.useForm<UpdateAccountForm>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<AccountItem | null>(null);

  useEffect(() => {
    fetchData({
      page: pagination.current,
      size: pagination.pageSize,
    });
  }, []);

  const handleEdit = (record: AccountItem) => {
    setEditingRecord(record);
    updateAccountForm.setFieldsValue({ 
      id: record.id
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async (values: UpdateAccountForm) => {
    try {
      if (!editingRecord) {
        setIsEditModalVisible(false);
        return;
      }
      setLoading(true);
      await APIClient.editAccount({ "password": CryptoJS.MD5(values.password).toString(), "id": editingRecord.id, });
      message.success('更新成功');
      setIsEditModalVisible(false);
      updateAccountForm.resetFields();
      fetchData({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      message.error('更新失败');
      console.error('更新失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (params: QueryParams) => {
    try {
      setLoading(true);
      const formValues = form.getFieldsValue();
      const response = await APIClient.getAccountList({
        ...params,
        name: formValues.username || undefined, // 添加 name 参数
      });
      setDataSource(response.data.accounts);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    const formValues = form.getFieldsValue();
    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchData({
      page: 1,
      size: pagination.pageSize,
      name: formValues.username || undefined, // 添加 name 参数
    });
  };

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({
      page: 1,
      size: pagination.pageSize,
    });
  };

  const handleCreate = async (values: NewAccountForm) => {
    try {
      setLoading(true);
      await APIClient.createAccount({"name": values.name, "password": CryptoJS.MD5(values.password).toString()});
      message.success('创建成功');
      setIsModalVisible(false);
      newAccountForm.resetFields();
      fetchData({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      console.error('创建失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      ellipsis: false,
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: false,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      ellipsis: true,
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString().replace(/\//g, '-')
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      ellipsis: true,
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString().replace(/\//g, '-')
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: AccountItem) => (
        <Space size="middle">
          <Button type="link" className={styles.smallButton} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" className={styles.smallButton} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleDelete = (record: AccountItem) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    
    try {
      setLoading(true);
      await APIClient.deleteAccount({ id: deletingRecord.id });
      message.success('删除成功');
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
      
      // 如果当前页只剩一条数据，删除后跳转到上一页
      if (dataSource.length === 1 && pagination.current > 1) {
        const newPage = pagination.current - 1;
        setPagination(prev => ({ ...prev, current: newPage }));
        fetchData({
          page: newPage,
          size: pagination.pageSize,
        });
      } else {
        // 否则刷新当前页
        fetchData({
          page: pagination.current,
          size: pagination.pageSize,
        });
      }
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonLayout>
      <Content className={styles.content}>
        <Form 
          form={form}
          layout="inline" 
          className={styles.searchForm}
          onFinish={handleQuery}
        >
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: 80 }}  // 添加固定宽度
            >
              查询
            </Button>
            <Button 
              style={{ marginLeft: 8, width: 80 }}  // 添加固定宽度
              onClick={handleReset}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.headerContent}>
          <div className={styles.title}>账号列表</div>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              新建
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData({
              page: pagination.current,
              size: pagination.pageSize,
            })} />
          </Space>
        </div>
        <div className={styles.tableContainer}>
          <Table 
            rowKey="id"
            columns={columns} 
            dataSource={dataSource}
            loading={loading}
            bordered
            pagination={{
              ...pagination,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize, total: pagination.total });
                fetchData({ 
                  page, 
                  size: pageSize, 
                });
              }
            }}
            scroll={{ y: 'calc(100vh - 300px)' }}
            className={styles.smallText}
          />
        </div>
      </Content>

      <Modal
        title="新建账号"
        open={isModalVisible}
        onOk={() => newAccountForm.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          newAccountForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form
          form={newAccountForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑账号"
        open={isEditModalVisible}
        onOk={() => updateAccountForm.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          updateAccountForm.resetFields();
          setEditingRecord(null);
        }}
        confirmLoading={loading}
      >
        <Form
          form={updateAccountForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="password"
            label="密码"
          >
            <Input.Password placeholder="不修改请留空" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="删除确认"
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletingRecord(null);
        }}
        confirmLoading={loading}
      >
        <p>确定要删除该账号吗？此操作不可恢复。</p>
      </Modal>
    </CommonLayout>
  );
};