import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ScheduleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { workerApi } from "../api";
import dayjs from "dayjs";
import WorkerCertification from "./WorkerCertification";

const { Option } = Select;
const { Item } = Form;

const DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const STATUS_COLORS = {
  未认证: "default",
  待审核: "orange",
  审核通过: "green",
  审核不通过: "red",
};

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [certificationVisible, setCertificationVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [currentWorkerId, setCurrentWorkerId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const res = await workerApi.getAll();
      setWorkers(res.data);
    } catch (error) {
      message.error("加载服务人员列表失败");
    }
  };

  const handleAdd = () => {
    setEditingWorker(null);
    form.resetFields();
    form.setFieldsValue({ skills: [], isActive: true, schedule: [] });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingWorker(record);
    form.setFieldsValue({
      ...record,
      skills: record.skills || [],
    });
    setModalVisible(true);
  };

  const handleSchedule = (record) => {
    setCurrentWorkerId(record._id);
    scheduleForm.setFieldsValue({
      schedule: (record.schedule || []).map((s) => ({
        ...s,
        startTime: s.startTime ? dayjs(s.startTime, "HH:mm") : null,
        endTime: s.endTime ? dayjs(s.endTime, "HH:mm") : null,
      })),
    });
    setScheduleModalVisible(true);
  };

  const handleCertification = (record) => {
    setSelectedWorkerId(record._id);
    setCertificationVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await workerApi.delete(id);
      message.success("删除成功");
      loadWorkers();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingWorker) {
        await workerApi.update(editingWorker._id, values);
        message.success("更新成功");
      } else {
        await workerApi.create(values);
        message.success("创建成功");
      }
      setModalVisible(false);
      loadWorkers();
    } catch (error) {
      message.error(editingWorker ? "更新失败" : "创建失败");
    }
  };

  const handleScheduleSubmit = async () => {
    try {
      const values = await scheduleForm.validateFields();
      const schedule = (values.schedule || []).map((s) => ({
        ...s,
        startTime: s.startTime ? s.startTime.format("HH:mm") : null,
        endTime: s.endTime ? s.endTime.format("HH:mm") : null,
      }));
      await workerApi.update(currentWorkerId, { schedule });
      message.success("排班更新成功");
      setScheduleModalVisible(false);
      loadWorkers();
    } catch (error) {
      message.error("排班更新失败");
    }
  };

  const columns = [
    { title: "姓名", dataIndex: "name", key: "name" },
    { title: "电话", dataIndex: "phone", key: "phone" },
    { title: "评分", dataIndex: "rating", key: "rating" },
    { title: "评价数", dataIndex: "reviewCount", key: "reviewCount" },
    {
      title: "技能",
      dataIndex: "skills",
      key: "skills",
      render: (skills) => (
        <Space wrap>
          {skills?.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "认证状态",
      dataIndex: "verificationStatus",
      key: "verificationStatus",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {status || "未认证"}
        </Tag>
      ),
    },
    {
      title: "接单权限",
      dataIndex: "canReceiveOrders",
      key: "canReceiveOrders",
      render: (can) =>
        can ? <Tag color="green">可接单</Tag> : <Tag color="red">不可接单</Tag>,
    },
    {
      title: "在职状态",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? <Tag color="green">在职</Tag> : <Tag color="red">离职</Tag>,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleCertification(record)}
          >
            资质管理
          </Button>
          <Button
            type="link"
            icon={<ScheduleOutlined />}
            onClick={() => handleSchedule(record)}
          >
            排班
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        添加服务人员
      </Button>
      <Table columns={columns} dataSource={workers} rowKey="_id" />

      <Modal
        title={editingWorker ? "编辑服务人员" : "添加服务人员"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input />
          </Item>
          <Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: "请输入电话" }]}
          >
            <Input />
          </Item>
          <Item
            name="skills"
            label="技能"
            rules={[{ required: true, message: "请选择技能" }]}
          >
            <Select mode="tags" placeholder="选择或输入技能">
              <Option value="清洁">清洁</Option>
              <Option value="保姆">保姆</Option>
              <Option value="月嫂">月嫂</Option>
              <Option value="育儿嫂">育儿嫂</Option>
              <Option value="护工">护工</Option>
            </Select>
          </Item>
          <Item name="isActive" label="在职状态" valuePropName="checked">
            <Switch />
          </Item>
        </Form>
      </Modal>

      <Modal
        title="设置排班"
        open={scheduleModalVisible}
        onOk={handleScheduleSubmit}
        onCancel={() => setScheduleModalVisible(false)}
        destroyOnClose
        width={700}
      >
        <Form form={scheduleForm} layout="vertical">
          <Form.List name="schedule">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "dayOfWeek"]}
                      rules={[{ required: true, message: "请选择星期" }]}
                      style={{ width: 120 }}
                    >
                      <Select placeholder="星期">
                        {DAYS.map((day, index) => (
                          <Option key={index} value={index}>
                            {day}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "startTime"]}
                      rules={[{ required: true, message: "请选择开始时间" }]}
                    >
                      <TimePicker
                        format="HH:mm"
                        minuteStep={30}
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "endTime"]}
                      rules={[{ required: true, message: "请选择结束时间" }]}
                    >
                      <TimePicker
                        format="HH:mm"
                        minuteStep={30}
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                    <Button type="dashed" onClick={() => remove(name)}>
                      删除
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    添加排班
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="资质管理"
        open={certificationVisible}
        onCancel={() => setCertificationVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {selectedWorkerId && (
          <WorkerCertification
            workerId={selectedWorkerId}
            onBack={() => setCertificationVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
}

export default Workers;
