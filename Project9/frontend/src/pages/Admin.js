import React from 'react';
import {
  Card,
  Grid,
  Typography,
  Space,
  Button,
  Message,
  Upload,
} from '@arco-design/web-react';
import { adminApi } from '../api';

const Row = Grid.Row;
const Col = Grid.Col;

function Admin() {
  const handleImportBooks = async (file) => {
    try {
      const response = await adminApi.importBooks(file);
      const data = response.data;
      Message.success(`成功导入 ${data.imported_count} 本图书`);
      if (data.errors && data.errors.length > 0) {
        Message.warning(`有 ${data.errors.length} 条记录导入失败`);
      }
    } catch (error) {
      console.error('Failed to import books:', error);
      Message.error(error.response?.data?.detail || '导入失败');
    }
    return false;
  };

  const handleExportBooks = async () => {
    try {
      const response = await adminApi.exportBooks();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `books_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Message.success('导出成功');
    } catch (error) {
      console.error('Failed to export books:', error);
      Message.error('导出失败');
    }
  };

  const handleImportReaders = async (file) => {
    try {
      const response = await adminApi.importReaders(file);
      const data = response.data;
      Message.success(`成功导入 ${data.imported_count} 位读者`);
      if (data.errors && data.errors.length > 0) {
        Message.warning(`有 ${data.errors.length} 条记录导入失败`);
      }
    } catch (error) {
      console.error('Failed to import readers:', error);
      Message.error(error.response?.data?.detail || '导入失败');
    }
    return false;
  };

  const handleExportReaders = async () => {
    try {
      const response = await adminApi.exportReaders();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `readers_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Message.success('导出成功');
    } catch (error) {
      console.error('Failed to export readers:', error);
      Message.error('导出失败');
    }
  };

  return (
    <div>
      <div className="page-header">
        <Typography.Title heading={5} className="page-title">
          系统管理
        </Typography.Title>
      </div>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="图书数据管理">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Typography.Paragraph>
                批量导入导出图书数据，支持 Excel 格式。
              </Typography.Paragraph>
              
              <div>
                <Typography.Text strong>导入格式说明：</Typography.Text>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>必填列：ISBN, 书名, 作者</li>
                  <li>可选列：出版社, 分类, 数量, 位置</li>
                  <li>支持列名中英文</li>
                </ul>
              </div>
              
              <Space>
                <Upload
                  customRequest={({ file }) => handleImportBooks(file)}
                  accept=".xlsx,.xls"
                  limit={1}
                >
                  <Button type="primary">
                    📥 导入图书
                  </Button>
                </Upload>
                <Button onClick={handleExportBooks}>
                  📤 导出图书
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="读者数据管理">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Typography.Paragraph>
                批量导入导出读者数据，支持 Excel 格式。
              </Typography.Paragraph>
              
              <div>
                <Typography.Text strong>导入格式说明：</Typography.Text>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>必填列：姓名, 卡号</li>
                  <li>可选列：电话, 邮箱, 部门</li>
                  <li>支持列名中英文</li>
                </ul>
              </div>
              
              <Space>
                <Upload
                  customRequest={({ file }) => handleImportReaders(file)}
                  accept=".xlsx,.xls"
                  limit={1}
                >
                  <Button type="primary">
                    📥 导入读者
                  </Button>
                </Upload>
                <Button onClick={handleExportReaders}>
                  📤 导出读者
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="系统设置" style={{ marginTop: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Typography.Paragraph>
              <strong>借阅规则：</strong>
            </Typography.Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li>借阅期限：30天</li>
              <li>超期罚款：每天 0.5 元</li>
              <li>最大借阅数：5本（可在读者设置中单独调整）</li>
            </ul>
          </Col>
          <Col span={12}>
            <Typography.Paragraph>
              <strong>预约规则：</strong>
            </Typography.Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li>只能预约当前不可借的图书</li>
              <li>预约有效期：7天</li>
              <li>同一读者不能同时预约同一本书</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Admin;
