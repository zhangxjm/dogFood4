import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Space,
  Tag,
  message,
  Row,
  Col,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { bookingApi, serviceApi, workerApi } from "../api";
import dayjs from "dayjs";

const { Option } = Select;
const { Item } = Form;

const STATUS_COLORS = {
  待确认: "orange",
  已确认: "blue",
  已完成: "green",
  已取消: "red",
};

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBookings();
    loadServices();
    loadWorkers();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      const res = await bookingApi.getAll(statusFilter);
      setBookings(res.data);
    } catch (error) {
      message.error("加载预约列表失败");
    }
  };

  const loadServices = async () => {
    try {
      const res = await serviceApi.getAll();
      setServices(res.data);
    } catch (error) {
      message.error("加载服务列表失败");
    }
  };

  const loadWorkers = async () => {
    try {
      const res = await workerApi.getAll(null, true);
      setWorkers(res.data);
    } catch (error) {
      message.error("加载服务人员列表失败");
    }
  };

  const handleServiceChange = async (serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (service) {
      const workersRes = await workerApi.getAll(service.category, true);
      setWorkers(workersRes.data);
    }
  };

  const handleWorkerDateChange = async (_, allValues) => {
    const { worker, service, date } = allValues;
    if (worker && service && date) {
      try {
        const res = await bookingApi.getAvailableSlots(worker, service, date);
        setAvailableSlots(res.data.availableSlots || []);
        if (res.data.availableSlots && res.data.availableSlots.length > 0) {
          const firstSlot = res.data.availableSlots[0];
          form.setFieldsValue({
            startTime: firstSlot.startTime,
            endTime: dayjs(firstSlot.endTime, "HH:mm"),
          });
        } else {
          form.setFieldsValue({
            startTime: undefined,
            endTime: undefined,
          });
        }
      } catch (error) {
        setAvailableSlots([]);
      }
    }
  };

  const handleAdd = () => {
    setEditingBooking(null);
    setAvailableSlots([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBooking(record);
    setAvailableSlots([]);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
      startTime: dayjs(record.startTime, "HH:mm"),
      endTime: dayjs(record.endTime, "HH:mm"),
    });
    setModalVisible(true);
  };

  const handleView = async (record) => {
    try {
      const res = await bookingApi.getById(record._id);
      setSelectedBooking(res.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("加载预约详情失败");
    }
  };

  const handleConfirm = async (id) => {
    try {
      await bookingApi.update(id, { status: "已确认" });
      message.success("预约已确认");
      loadBookings();
    } catch (error) {
      message.error("确认失败");
    }
  };

  const handleComplete = async (id) => {
    try {
      await bookingApi.update(id, { status: "已完成" });
      message.success("预约已完成");
      loadBookings();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingApi.update(id, { status: "已取消" });
      message.success("预约已取消");
      loadBookings();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleDelete = async (id) => {
    try {
      await bookingApi.delete(id);
      message.success("预约已删除");
      loadBookings();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime,
        endTime: values.endTime.format
          ? values.endTime.format("HH:mm")
          : values.endTime,
      };

      if (editingBooking) {
        await bookingApi.update(editingBooking._id, submitData);
        message.success("更新成功");
      } else {
        await bookingApi.create(submitData);
        message.success("预约成功");
      }
      setModalVisible(false);
      loadBookings();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          (editingBooking ? "更新失败" : "预约失败"),
      );
    }
  };

  const columns = [
    { title: "客户姓名", dataIndex: "customerName", key: "customerName" },
    { title: "服务", dataIndex: ["service", "name"], key: "service" },
    { title: "服务人员", dataIndex: ["worker", "name"], key: "worker" },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      render: (v) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: "时间",
      key: "time",
      render: (_, r) => `${r.startTime}-${r.endTime}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "待确认", value: "待确认" },
        { text: "已确认", value: "已确认" },
        { text: "已完成", value: "已完成" },
        { text: "已取消", value: "已取消" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
    },
    {
      title: "金额",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => `¥${v}`,
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {record.status === "待确认" && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirm(record._id)}
            >
              确认
            </Button>
          )}
          {record.status === "已确认" && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record._id)}
            >
              完成
            </Button>
          )}
          {(record.status === "待确认" || record.status === "已确认") && (
            <Button
              type="link"
              icon={<StopOutlined />}
              onClick={() => handleCancel(record._id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建预约
          </Button>
          <Select
            style={{ width: 150 }}
            placeholder="状态筛选"
            allowClear
            onChange={setStatusFilter}
          >
            <Option value="待确认">待确认</Option>
            <Option value="已确认">已确认</Option>
            <Option value="已完成">已完成</Option>
            <Option value="已取消">已取消</Option>
          </Select>
        </Space>
      </Row>

      <Table columns={columns} dataSource={bookings} rowKey="_id" />

      <Modal
        title={editingBooking ? "编辑预约" : "新建预约"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleWorkerDateChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Item
                name="service"
                label="服务"
                rules={[{ required: true, message: "请选择服务" }]}
              >
                <Select placeholder="选择服务" onChange={handleServiceChange}>
                  {services.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name} - ¥{s.price} ({s.duration}分钟)
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="worker"
                label="服务人员"
                rules={[{ required: true, message: "请选择服务人员" }]}
              >
                <Select placeholder="选择服务人员">
                  {workers.map((w) => (
                    <Option key={w._id} value={w._id}>
                      {w.name} (评分:{w.rating})
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Item
                name="date"
                label="预约日期"
                rules={[{ required: true, message: "请选择日期" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Item>
            </Col>
            <Col span={8}>
              <Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: "请选择开始时间" }]}
              >
                <Select placeholder="可用时间段">
                  {availableSlots.map((slot, idx) => (
                    <Option key={idx} value={slot.startTime}>
                      {slot.startTime} - {slot.endTime}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={8}>
              <Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: "请选择结束时间" }]}
              >
                <TimePicker
                  format="HH:mm"
                  style={{ width: "100%" }}
                  minuteStep={30}
                />
              </Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Item
                name="customerName"
                label="客户姓名"
                rules={[{ required: true, message: "请输入姓名" }]}
              >
                <Input />
              </Item>
            </Col>
            <Col span={8}>
              <Item
                name="customerPhone"
                label="联系电话"
                rules={[{ required: true, message: "请输入电话" }]}
              >
                <Input />
              </Item>
            </Col>
            <Col span={8}>
              <Item
                name="totalPrice"
                label="金额"
                rules={[{ required: true, message: "请输入金额" }]}
              >
                <Input type="number" min={0} />
              </Item>
            </Col>
          </Row>

          <Item
            name="customerAddress"
            label="服务地址"
            rules={[{ required: true, message: "请输入地址" }]}
          >
            <Input />
          </Item>

          <Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Item>
        </Form>
      </Modal>

      <Modal
        title="预约详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="客户姓名" span={1}>
              {selectedBooking.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话" span={1}>
              {selectedBooking.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label="服务地址" span={2}>
              {selectedBooking.customerAddress}
            </Descriptions.Item>
            <Descriptions.Item label="服务项目" span={1}>
              {selectedBooking.service?.name}
            </Descriptions.Item>
            <Descriptions.Item label="服务人员" span={1}>
              {selectedBooking.worker?.name}
            </Descriptions.Item>
            <Descriptions.Item label="预约日期" span={1}>
              {dayjs(selectedBooking.date).format("YYYY-MM-DD")}
            </Descriptions.Item>
            <Descriptions.Item label="预约时间" span={1}>
              {selectedBooking.startTime} - {selectedBooking.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="预约状态" span={1}>
              <Tag color={STATUS_COLORS[selectedBooking.status]}>
                {selectedBooking.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单金额" span={1}>
              ¥{selectedBooking.totalPrice}
            </Descriptions.Item>
            {selectedBooking.notes && (
              <Descriptions.Item label="备注" span={2}>
                {selectedBooking.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default Bookings;
