import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Upload,
  Descriptions,
  Divider,
} from "antd";
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import MainLayout from "../components/MainLayout";
import { processApi, uploadApi } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ProcessesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDef, setSelectedDef] = useState<any>(null);
  const [flowChart, setFlowChart] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await processApi.getDefinitions();
      setDefinitions(data || []);
    } catch (error) {
      message.error("获取流程定义失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProcess = async (def: any) => {
    setSelectedDef(def);
    form.resetFields();
    setAttachments([]);
    setModalVisible(true);
    try {
      const { data } = await processApi.getFlowChart(def._id);
      setFlowChart(data);
    } catch (error) {
      setFlowChart(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let formData = {};

      if (selectedDef.type === "leave") {
        formData = {
          leaveType: values.leaveType,
          startDate: values.dates[0].format("YYYY-MM-DD"),
          endDate: values.dates[1].format("YYYY-MM-DD"),
          days: values.days,
          reason: values.reason,
        };
      } else if (selectedDef.type === "reimbursement") {
        formData = {
          amount: values.amount,
          expenseType: values.expenseType,
          reason: values.reason,
        };
      } else if (selectedDef.type === "business_trip") {
        formData = {
          destination: values.destination,
          startDate: values.dates[0].format("YYYY-MM-DD"),
          endDate: values.dates[1].format("YYYY-MM-DD"),
          purpose: values.purpose,
        };
      }

      await processApi.startProcess({
        processDefinitionId: selectedDef._id,
        title: values.title,
        formData,
        attachments: attachments.map((a: any) => a.url),
      });

      message.success("发起审批成功");
      setModalVisible(false);
      router.push("/my-processes");
    } catch (error: any) {
      message.error(error.response?.data?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const { data } = await uploadApi.uploadSingle(file);
      setAttachments((prev) => [...prev, data]);
      message.success("上传成功");
    } catch (error) {
      message.error("上传失败");
    }
    return false;
  };

  const getTypeIcon = (type: string) => {
    const colors: any = {
      leave: "#1890ff",
      reimbursement: "#52c41a",
      business_trip: "#722ed1",
    };
    return (
      <FileTextOutlined
        style={{ fontSize: 48, color: colors[type] || "#1890ff" }}
      />
    );
  };

  const getTypeName = (type: string) => {
    const names: any = {
      leave: "请假",
      reimbursement: "报销",
      business_trip: "出差",
    };
    return names[type] || type;
  };

  const renderForm = () => {
    if (!selectedDef) return null;

    if (selectedDef.type === "leave") {
      return (
        <>
          <Form.Item
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: "请选择请假类型" }]}
          >
            <Input placeholder="如：年假、事假、病假" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="请假时间"
            rules={[{ required: true, message: "请选择时间" }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            name="days"
            label="请假天数"
            rules={[{ required: true, message: "请输入天数" }]}
          >
            <InputNumber min={0.5} step={0.5} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="请假原因"
            rules={[{ required: true, message: "请输入原因" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      );
    }

    if (selectedDef.type === "reimbursement") {
      return (
        <>
          <Form.Item
            name="amount"
            label="报销金额（元）"
            rules={[{ required: true, message: "请输入金额" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="expenseType"
            label="费用类型"
            rules={[{ required: true, message: "请选择费用类型" }]}
          >
            <Input placeholder="如：差旅费、办公费、招待费" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="报销说明"
            rules={[{ required: true, message: "请输入说明" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      );
    }

    if (selectedDef.type === "business_trip") {
      return (
        <>
          <Form.Item
            name="destination"
            label="出差地点"
            rules={[{ required: true, message: "请输入地点" }]}
          >
            <Input placeholder="如：北京" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="出差时间"
            rules={[{ required: true, message: "请选择时间" }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="出差事由"
            rules={[{ required: true, message: "请输入事由" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </>
      );
    }

    return null;
  };

  return (
    <MainLayout activeKey="/processes">
      <Title level={3}>发起审批</Title>
      <Row gutter={[16, 16]}>
        {definitions.map((def: any) => (
          <Col xs={24} sm={12} md={8} key={def._id}>
            <Card
              hoverable
              loading={loading}
              onClick={() => handleSelectProcess(def)}
              style={{ textAlign: "center", minHeight: 200 }}
            >
              <div style={{ marginBottom: 16 }}>{getTypeIcon(def.type)}</div>
              <Title level={4} style={{ margin: 0 }}>
                {def.name}
              </Title>
              <p style={{ color: "#999", marginTop: 8 }}>{def.description}</p>
              <Button type="primary" style={{ marginTop: 16 }}>
                发起申请
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`发起${selectedDef?.name || "审批"}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={800}
        okText="提交"
        cancelText="取消"
        destroyOnClose
      >
        <Divider orientation="left">审批流程</Divider>
        {flowChart && (
          <div
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {flowChart.definition?.nodes?.map((node: any, idx: number) => (
                <div
                  key={node.id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    className={`flow-node flow-node-${node.type === "start" ? "start" : node.type === "end" ? "end" : "approve"}`}
                    style={{ position: "relative", minWidth: 100 }}
                  >
                    {node.name}
                  </div>
                  {idx < flowChart.definition.nodes.length - 1 && (
                    <span style={{ margin: "0 8px" }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider orientation="left">申请信息</Divider>
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="申请标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input placeholder="请输入申请标题" />
          </Form.Item>
          {renderForm()}
          <Form.Item label="附件上传">
            <Upload
              beforeUpload={handleUpload}
              showUploadList={true}
              fileList={attachments}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
