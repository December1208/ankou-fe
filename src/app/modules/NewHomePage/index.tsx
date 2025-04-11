import React, { useEffect, useState } from 'react';
import { Layout, Table, Form, Input, Button, Space, message, Modal, Tooltip, DatePicker } from 'antd';
import { 
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
import styles from './index.module.scss';
import { APIClient } from '../../../apis/base';
import { AnkouConfigItem, UVData } from '../../models/ankouConfig';
import { CommonLayout } from '../../components/CommonLayout';
import { useContext } from 'react';
import { UserStoreContext } from '../../globalStore/userStore';
import { USER_ROLES } from '../../constants';
import dayjs from 'dayjs';


interface QueryParams {
  original_key?: string;
  key?: string;
  original_url?: string;
  page: number;
  size: number;
}

// Update NewConfigForm interface
interface NewConfigForm {
  original_key: string;
  original_url: string;
  ratio: number;
  start_at: dayjs.Dayjs;  // Change to dayjs.Dayjs
  end_at: dayjs.Dayjs;    // Change to dayjs.Dayjs
}

// 修改 UpdateConfigForm 接口
interface UpdateConfigForm {
    config_id: number;
    ratio: number;
    start_at: dayjs.Dayjs;
    end_at: dayjs.Dayjs;
}

export const SystemListPage: React.FC = () => {
  const userContext = useContext(UserStoreContext);
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
    setEditingRecord(record);
    updateConfigForm.setFieldsValue({ 
      ratio: record.ratio, 
      config_id: record.id,
      start_at: dayjs(record.start_at * 1000),
      end_at: dayjs(record.end_at * 1000)
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async (values: UpdateConfigForm) => {
    try {
      if (!editingRecord) {
        setIsEditModalVisible(false);
        return;
      }
      setLoading(true);
      await APIClient.updateConfig({
        config_id: editingRecord.id,
        ratio: values.ratio,
        start_at: Math.floor(values.start_at.valueOf() / 1000),
        end_at: Math.floor(values.end_at.valueOf() / 1000)
      });
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
      await APIClient.createConfig({
        ...values,
        start_at: Math.floor(values.start_at.valueOf() / 1000),
        end_at: Math.floor(values.end_at.valueOf() / 1000)
      });
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
          -
        </Tooltip>
      )
    },
    {
      title: '原数量',
      dataIndex: 'original_count',
      key: 'original_count',
      width: 100,
      ellipsis: true,
      render: (uvData: UVData[]) => `[${uvData.map(item => item.count).join(',')}]` || '[]'
    },
    {
      title: '副数量',
      dataIndex: 'secondary_count',
      key: 'secondary_count',
      width: 100,
      ellipsis: true,
      render: (uvData: UVData[]) => `[${uvData.map(item => item.count).join(',')}]` || '[]'
    },
    {
      title: '差值',
      dataIndex: 'difference',
      key: 'difference',
      width: 80,
      ellipsis: true
    },
    {
      title: '开始时间',
      dataIndex: 'start_at',
      key: 'start_at',
      width: 150,
      ellipsis: true,
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString().replace(/\//g, '-')
    },
    {
        title: '结束时间',
        dataIndex: 'end_at',
        key: 'end_at',
        width: 150,
        ellipsis: true,
        render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString().replace(/\//g, '-')
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
          {userContext.getUser()?.role === USER_ROLES.ADMIN && (
            <Button type="link" className={styles.smallButton} danger onClick={() => handleDelete(record)}>删除</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <CommonLayout>
      <Content className={styles.content}>
        <Form 
          form={form}
          layout="inline" 
          className={styles.searchForm}
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
          <div className={styles.title}>查询列表</div>
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
              original_key: form.getFieldValue('originalKey') || '',
              key: form.getFieldValue('secondaryKey') || '',
              original_url: form.getFieldValue('originalLink') || ''
            })} />
          </Space>
        </div>
        <div className={styles.tableContainer}>
          <Table 
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
                  original_key: form.getFieldValue('originalKey') || '', 
                  key: form.getFieldValue('secondaryKey') || '', 
                  original_url: form.getFieldValue('originalLink') || '' 
                });
              }
            }}
            scroll={{ y: 'calc(100vh - 300px)' }}
            className={styles.smallText}
          />
        </div>
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
            <Form.Item
              name="start_at"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="end_at"
              label="结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 编辑配置弹窗 */}
        <Modal
          title="编辑配置"
          open={isEditModalVisible}
          onOk={() => updateConfigForm.submit()}
          onCancel={() => {
            setIsEditModalVisible(false);
            updateConfigForm.resetFields();
          }}
          confirmLoading={loading}
        >
          <Form
            form={updateConfigForm}
            layout="vertical"
            onFinish={handleUpdate}
          >
            <Form.Item
              name="ratio"
              label="比例"
              rules={[{ required: true, message: '请输入比例' }]}
            >
              <Input type="number" placeholder="请输入比例" />
            </Form.Item>
            <Form.Item
              name="start_at"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="end_at"
              label="结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 删除确认弹窗 */}
        <Modal
          title="确认删除"
          open={isDeleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setDeletingRecord(null);
          }}
          confirmLoading={loading}
        >
          <p>确定要删除这条配置吗？</p>
          <p>原卡密：{deletingRecord?.original_key}</p>
          <p>副卡密：{deletingRecord?.key}</p>
        </Modal>



      </Content>
    </CommonLayout>
  );
};
