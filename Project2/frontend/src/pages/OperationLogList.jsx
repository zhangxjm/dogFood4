import React, { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import request from '../utils/request';

const moduleOptions = [
  { label: '用户管理', value: '用户管理' },
  { label: '部门管理', value: '部门管理' },
  { label: '资产分类', value: '资产分类' },
  { label: '资产管理', value: '资产管理' },
  { label: '操作日志', value: '操作日志' },
];

export default function OperationLogList() {
  const actionRef = useRef();

  const columns = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '模块', dataIndex: 'module', width: 120, filters: moduleOptions },
    { title: '操作', dataIndex: 'operation', width: 120 },
    { title: '方法', dataIndex: 'method', width: 200, ellipsis: true },
    { title: '参数', dataIndex: 'params', width: 200, ellipsis: true },
    { title: 'IP地址', dataIndex: 'ip', width: 140 },
    {
      title: '耗时(ms)',
      dataIndex: 'costTime',
      width: 100,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueEnum: {
        1: { text: '成功', status: 'Success' },
        0: { text: '失败', status: 'Error' },
      },
      render: (val) => val === 1 ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>,
    },
    { title: '错误信息', dataIndex: 'errorMsg', width: 200, ellipsis: true },
    { title: '操作时间', dataIndex: 'createTime', width: 170, valueType: 'dateTime' },
  ];

  return (
    <div>
      <ProTable
        headerTitle="操作日志"
        actionRef={actionRef}
        rowKey="id"
        search={{ defaultCollapsed: false, labelWidth: 80 }}
        toolBarRender={false}
        columns={columns}
        request={async (params) => {
          const res = await request.get('/operation-logs', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              username: params.username,
              module: params.module,
              status: params.status,
            },
          });
          return {
            data: res.data.records,
            success: true,
            total: res.data.total,
          };
        }}
      />
    </div>
  );
}
