import React, { useEffect, useState } from 'react';
import { Layout, Menu, Table, Form, Input, Button, Space, Divider, message, Modal, Tooltip } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  ReloadOutlined,
  BarsOutlined,
  SettingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import { AnkouConfigItem } from '../../models/ankouConfig';

const { Header, Sider, Content } = Layout;

interface QueryParams {
  original_key?: string;
  key?: string;
  original_url?: string;
  page: number;
  size: number;
}

interface NewConfigForm {
  original_key: string;
  original_url: string;
  ratio: number;
}

interface UpdateConfigForm {
    config_id: number
    ratio: number
}

export const SystemListPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<AnkouConfigItem[]>([]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newConfigForm] = Form.useForm<NewConfigForm>();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // 编辑配置弹窗状态
  const [editingRecord, setEditingRecord] = useState<AnkouConfigItem | null>(null); // 新增状态
  const [updateConfigForm] = Form.useForm<UpdateConfigForm>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // 删除确认弹窗状态
  const [deletingRecord, setDeletingRecord] = useState<AnkouConfigItem | null>(null); // 要删除的记录

  useEffect(() => {
    // 在组件加载时请求数据
    fetchData({
      page: pagination.current,
      size: pagination.pageSize,
      original_key: '',
      key: '',
      original_url: ''
    });
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  const handleEdit = (record: AnkouConfigItem) => {
    setEditingRecord(record); // 设置当前编辑的记录
    console.log(record.ratio)
    updateConfigForm.setFieldsValue({ ratio: record.ratio, config_id: record.id }); // 设置表单初始值
    setIsEditModalVisible(true); // 显示编辑弹窗
  };

  const handleUpdate = async (values: UpdateConfigForm) => {
    try {
      if (!editingRecord) {
        setIsEditModalVisible(false);
        return
      }
      setLoading(true);
      await APIClient.updateConfig({config_id: editingRecord.id, ratio: values.ratio}); // 调用更新 API
      message.success('更新成功');
      setIsEditModalVisible(false);
      updateConfigForm.resetFields();
      fetchData({
        page: pagination.current,
        size: pagination.pageSize,
        original_key: form.getFieldValue('originalKey') || '',
        key: form.getFieldValue('secondaryKey') || '',
        original_url: form.getFieldValue('originalLink') || ''
      });
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record: AnkouConfigItem) => {
    setDeletingRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    
    try {
      setLoading(true);
      await APIClient.deleteConfig({ config_id: deletingRecord.id });
      message.success('删除成功');
      setIsDeleteModalVisible(false);
      setDeletingRecord(null);
      
      // 获取当前页数据
      const currentPageData = await APIClient.getConfigList({
        page: pagination.current,
        size: pagination.pageSize,
        original_key: form.getFieldValue('originalKey') || '',
        key: form.getFieldValue('secondaryKey') || '',
        original_url: form.getFieldValue('originalLink') || ''
      });

      // 如果当前页没有数据了，且不是第一页，则跳转到上一页
      if (currentPageData.data.configs.length === 0 && pagination.current > 1) {
        const newPage = pagination.current - 1;
        setPagination(prev => ({ ...prev, current: newPage }));
        fetchData({
          page: newPage,
          size: pagination.pageSize,
          original_key: form.getFieldValue('originalKey') || '',
          key: form.getFieldValue('secondaryKey') || '',
          original_url: form.getFieldValue('originalLink') || ''
        });
      } else {
        // 否则刷新当前页数据
        fetchData({
          page: pagination.current,
          size: pagination.pageSize,
          original_key: form.getFieldValue('originalKey') || '',
          key: form.getFieldValue('secondaryKey') || '',
          original_url: form.getFieldValue('originalLink') || ''
        });
      }
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setIsDeleteModalVisible(false);
      setLoading(false);
    }
  };

  const fetchData = async (params: QueryParams) => {
    try {
      setLoading(true);
      const queryParams = {
        page: params.page,
        size: params.size,
        original_key: params.original_key || '',
        original_url: params.original_url || '',
        key: params.key || ''
      };
      
      const response = await APIClient.getConfigList(queryParams);
      setDataSource(response.data.configs);
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

  const handleQuery = async (values: any) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchData({
      page: 1,
      size: pagination.pageSize,
      original_key: values.originalKey,
      key: values.secondaryKey,
      original_url: values.originalLink
    });
  };

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData({
      page: 1,
      size: pagination.pageSize,
      original_key: '',
      key: '',
      original_url: ''
    });
  };

  const handleCreate = async (values: NewConfigForm) => {
    try {
      setLoading(true);
      await APIClient.createConfig(values);
      message.success('创建成功');
      setIsModalVisible(false);
      newConfigForm.resetFields();
      // 刷新当前页面数据
      fetchData({
        page: pagination.current,
        size: pagination.pageSize,
        original_key: form.getFieldValue('originalKey') || '',
        key: form.getFieldValue('secondaryKey') || '',
        original_url: form.getFieldValue('originalLink') || ''
      });
    } catch (error) {
      message.error('创建失败');
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
      title: '原卡密',
      dataIndex: 'original_key',
      key: 'original_key',
      width: 200,
      ellipsis: false,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '副卡密',
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
        title: '比例',
        dataIndex: 'ratio',
        key: 'ratio',
        width: 40,
        ellipsis: true
    },
    {
      title: '原链接',
      dataIndex: 'original_url',
      key: 'original_url',
      width:100,
      ellipsis: {
        showTitle: true
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '副链接',
      dataIndex: 'url',
      key: 'url',
      width:100,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '原数量',
      dataIndex: 'original_count',
      key: 'original_count',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => `[${count.join(', ')}]` || '[]'
    },
    {
      title: '副数量',
      dataIndex: 'secondary_count',
      key: 'secondary_count',
      width: 100,
      ellipsis: true,
      render: (count: number[]) => `[${count.join(', ')}]` || '[]'
    },
    {
      title: '差值',
      dataIndex: 'difference',
      key: 'difference',
      width: 80,
      ellipsis: true
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
      render: (_: unknown, record: AnkouConfigItem) => (
        <Space size="middle">
          <Button type="link" className={styles.smallButton} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" className={styles.smallButton} danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

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
        <Menu theme="light" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">首页</Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ overflow: 'hidden' }}>
        <Header className={styles.header}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: styles.trigger,
            onClick: () => setCollapsed(!collapsed),
          })}
          <Form 
            form={form}
            layout="inline" 
            style={{ flex: 1 }}
            onFinish={handleQuery}
          >
            <Form.Item name="originalKey" label="原卡密">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item name="secondaryKey" label="副卡密">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item name="originalLink" label="原链接">
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={handleReset}>重置</Button>
              <Button type="link" style={{ float: 'right' }}>展开 ▼</Button>
            </Form.Item>
          </Form>
        </Header>
        <Content className={styles.content}>
          <div className={styles.headerContent}>
            <div className={styles.title}>查询列表</div>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                新建
              </Button>
              <Button danger>删除</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData({
                page: pagination.current,
                size: pagination.pageSize,
                original_key: form.getFieldValue('originalKey') || '',
                key: form.getFieldValue('secondaryKey') || '',
                original_url: form.getFieldValue('originalLink') || ''
              })} />
              <Button icon={<BarsOutlined />} />
              <Button icon={<SettingOutlined />} />
            </Space>
          </div>
          <div className={styles.tableContainer}>
          <Table 
          columns={columns} 
          dataSource={dataSource}
          loading={loading}
          bordered
          pagination={{
            ...pagination, // 确保 pagination 包含 total
            showSizeChanger: true, // 允许用户更改每页显示条数
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total });
              fetchData({ 
                page, 
                size: pageSize, 
                original_key: form.getFieldValue('originalKey') || '', 
                key: form.getFieldValue('secondaryKey') || '', 
                original_url: form.getFieldValue('originalLink') || '' 
              });
            }
          }}
          scroll={{ y: 'calc(100vh - 300px)' }}
        //   size="small"
          className={styles.smallText}
        />
          </div>
        </Content>
      </Layout>

      <Modal
        title="新建配置"
        open={isModalVisible}
        onOk={() => newConfigForm.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          newConfigForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form
          form={newConfigForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="original_key"
            label="原卡密"
            rules={[{ required: true, message: '请输入原卡密' }]}
          >
            <Input placeholder="请输入原卡密" />
          </Form.Item>

          <Form.Item
            name="original_url"
            label="原链接"
            rules={[{ required: true, message: '请输入原链接' }]}
          >
            <Input placeholder="请输入原链接" />
          </Form.Item>
          <Form.Item
            name="ratio"
            label="比例"
            rules={[{ required: true, message: '请输入比例' }]}
          >
            <Input type="number" placeholder="请输入比例" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑配置"
        open={isEditModalVisible} // 使用编辑状态
        onOk={() => updateConfigForm.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          updateConfigForm.resetFields();
          setEditingRecord(null); // 重置编辑记录
        }}
        confirmLoading={loading}
      >
        <Form
          form={updateConfigForm}
          layout="vertical"
          onFinish={handleUpdate} // 使用 handleUpdate 处理编辑
        >
          <Form.Item
            name="ratio"
            label="比例"
            rules={[{ required: true, message: '请输入比例' }]}
          >
            <Input type="number" placeholder="请输入比例" />
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
        <p>确定要删除这条配置吗？此操作不可恢复。</p>
      </Modal>
    </Layout>
  );
};
